"""Rappi (Davivienda-issued) "Extracto de tarjeta de crédito" parser.

Calibrated against the anonymized samples at repo-root `.samples/rappi.pdf`
and `.samples/rappi2.pdf`. Like Davibank this is a CREDIT CARD statement (no
running account balance); every movement lives in a SINGLE "Detalle de
transacciones" table (page 2+).

What we import — the PERIOD charge, not the purchase total
--------------------------------------------------------
Each row prints, among others, two money columns:

    ... $VALOR_TRANSACCION  $CAPITAL_FACTURADO_DEL_PERIODO  k de N  $PENDIENTE ...
        (column 4)          (column 5)

`Valor transacción` is the full purchase amount; `Capital facturado del
periodo` (column 5) is what the card actually charges THIS billing period. For
a one-shot `1 de 1` purchase the two are equal, but for anything deferred into
installments (`k de N`, including "COMPRA DE CARTERA") column 5 is the single
monthly installment. We import column 5 for EVERY row, so a purchase split
across months contributes only its current-period charge. This makes the
imported sum reconcile exactly against the statement's declared
"+ Capital facturado consumos del mes" total (see `reconcile_declared_total`).

Payments ("PAGOS POR PSE") print `N/A` in every installment column, so they
carry a single money token and are excluded automatically.

Why coordinate-based, not line-based
-------------------------------------
A long merchant name wraps across up to three visual sub-lines, and
`extract_text` flattens each sub-line independently — the numeric columns end
up on the middle sub-line with an EMPTY description, while the merchant tokens
sit on the lines above and below. Matching flattened lines therefore loses
these descriptions. Instead we read positioned words (`extract_words`), group
them into rows by vertical proximity to each dated "anchor" line, pick column 5
as the second money token by x-position, and rebuild the description from every
word in the row's band that falls in the description column.

- Amounts are Colombian notation: `.` thousands, `,` decimals (`$149.054,00`).
- Dates are already ISO (YYYY-MM-DD); the printed date is the purchase date
  (for a deferred purchase, its original date, not the current period).
"""

import re

import pdfplumber

from app.schemas import ParseResult, RawTransaction
from app.parsers.base import parse_amount, reconcile_declared_total

SIGNATURE = "Rappi"

_ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
# A money token: optional `$`, optional sign, digits with `.` thousands and a
# `,dd` decimal tail. The trailing `$` anchor rejects the `1,3170%` /`17,00%`
# rate columns, which end in `%`.
_MONEY = re.compile(r"^\$?-?\d[\d.]*,\d{2}$")

_DECLARED_CAPITAL = re.compile(
    r"Capital facturado consumos del mes\s*\$\s*([\d.]+,\d{2})"
)

# Statement billing period end, e.g. "Hasta 26 jun 2026". A deferred purchase
# from a prior month is re-charged on this date, so its installment rows are
# dated to the period end rather than to the original purchase date.
_PERIOD_END = re.compile(r"Hasta\s+(\d{1,2})\s+([a-záéíñ]{3})\.?\s+(\d{4})", re.I)
_SPANISH_MONTHS = {
    "ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6,
    "jul": 7, "ago": 8, "sep": 9, "oct": 10, "nov": 11, "dic": 12,
}

# The installment marker printed after the money columns, e.g. "9 de 14". The
# lowercase " de " never collides with uppercase merchant tokens ("COMPRA DE
# CARTERA"), so a first match on the row is safe.
_CUOTA = re.compile(r"(\d+) de \d+")

# Max vertical gap (points) for a line to still belong to a transaction row.
# Rows are ~18.7pt apart; wrapped-description sub-lines sit ~6pt off the anchor,
# so half the row pitch captures wraps while cleanly separating adjacent rows
# and dropping the table header/footer.
_ROW_BAND = 9.0


def _amount(raw: str) -> float:
    return parse_amount(raw.lstrip("$"), decimal_sep=",", thousands_sep=".")


def _declared_total(first_page_text: str) -> float | None:
    match = _DECLARED_CAPITAL.search(first_page_text)
    return _amount(match.group(1)) if match else None


def _period_end(first_page_text: str) -> str | None:
    match = _PERIOD_END.search(first_page_text)
    if not match:
        return None
    day, month_abbr, year = match.groups()
    month = _SPANISH_MONTHS.get(month_abbr.lower())
    if month is None:
        return None
    return f"{int(year):04d}-{month:02d}-{int(day):02d}"


def _cluster_lines(words: list[dict]) -> list[tuple[float, list[dict]]]:
    """Group positioned words into visual lines keyed by their rounded `top`,
    returned in top-to-bottom order."""
    lines: dict[float, list[dict]] = {}
    for word in words:
        lines.setdefault(round(word["top"], 1), []).append(word)
    return sorted(lines.items())


def parse(pdf: "pdfplumber.PDF") -> ParseResult:
    pages_text = [page.extract_text() or "" for page in pdf.pages]
    declared_total = _declared_total(pages_text[0]) if pages_text else None
    period_end = _period_end(pages_text[0]) if pages_text else None

    transactions: list[RawTransaction] = []
    magnitudes: list[float] = []

    for page in pdf.pages:
        words = page.extract_words(use_text_flow=False, keep_blank_chars=False)
        lines = _cluster_lines(words)

        # Anchor rows are the ones carrying an ISO transaction date.
        anchor_tops = [
            top for top, ws in lines if any(_ISO_DATE.match(w["text"]) for w in ws)
        ]
        if not anchor_tops:
            continue

        # Attach every line to its nearest anchor, dropping lines farther than
        # one row band (headers/footers, and the totals block on page 1).
        groups: dict[float, list[dict]] = {top: [] for top in anchor_tops}
        for top, ws in lines:
            nearest = min(anchor_tops, key=lambda a: abs(a - top))
            if abs(nearest - top) <= _ROW_BAND:
                groups[nearest].extend(ws)

        for anchor_top in anchor_tops:
            row_words = sorted(groups[anchor_top], key=lambda w: (w["top"], w["x0"]))
            date_word = next(w for w in row_words if _ISO_DATE.match(w["text"]))

            money = [w for w in row_words if _MONEY.match(w["text"])]
            # Columns in order: Valor transacción, Capital facturado del periodo,
            # Capital pendiente. A payment row has a single money token (the rest
            # are N/A) — skip it.
            if len(money) < 2:
                continue

            capital_facturado = money[1]  # column 5 — the period's actual charge
            amount = abs(_amount(capital_facturado["text"]))

            # Description spans the row's band between the date and the first
            # money column; rebuild it in reading order (top, then left-to-right).
            first_money_x0 = min(w["x0"] for w in money)
            description = " ".join(
                w["text"]
                for w in row_words
                if date_word["x1"] < w["x0"] < first_money_x0
            ).strip()

            # A prior-period installment (k > 1) is charged THIS period, so date
            # it to the period end rather than the original purchase date. This
            # period's own purchases (k == 1, incl. a first installment) keep it.
            cuota = _CUOTA.search(" ".join(w["text"] for w in row_words))
            is_prior_installment = cuota is not None and int(cuota.group(1)) > 1
            date = period_end if (is_prior_installment and period_end) else date_word["text"]

            magnitudes.append(amount)
            transactions.append(
                RawTransaction(
                    date=date,
                    description=description or "Sin descripción",
                    value=-amount,
                    type="expenses",
                    categoryName="",
                    rawLine=" ".join(w["text"] for w in row_words),
                )
            )

    reconciliation = reconcile_declared_total(magnitudes, declared_total)
    return ParseResult(transactions=transactions, reconciliation=reconciliation)
