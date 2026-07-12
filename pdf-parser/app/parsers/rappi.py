"""Rappi (Davivienda-issued) "Extracto de tarjeta de crédito" parser.

Calibrated against the anonymized sample at repo-root `.samples/rappi.pdf`.
Like Davibank this is a CREDIT CARD statement (no running account balance),
but its detail table is structured differently:

- All movements live in a SINGLE "Detalle de transacciones" table (page 2+),
  with NO section separation between this period's purchases, ongoing
  installments from prior periods, and payments. The distinguishing signal is
  the "Cuotas" column, printed as `k de N`:
    * `1 de N`  -> a purchase made THIS period (first/only installment) — IMPORT
    * `k de N` (k>1) -> a prior-period purchase re-listed for its installment
      this month (already imported in its own month) — SKIP
  Payments (e.g. "PAGOS POR PSE") print `N/A` in the installment columns, so
  they never match the row pattern and are excluded automatically.

- Row layout (single-space flattened by `extract_text`):
      <Tarjeta> YYYY-MM-DD <description> $ VALUE $ CAPITAL  k de N  $ PENDING  MV%  EA%
      Fisica 2026-04-02 SUPERMU $149.054,00 $149.054,00 1 de 1 $0,00 0,0000% 0,00%
  VALUE ("Valor transacción") is the full purchase amount and is anchored on
  the `$CAPITAL k de N` column tail, immune to money-shaped description tokens.

- Reconciliation: the statement declares "+ Consumos del mes $X" on page 1,
  which equals the sum of the imported (`1 de N`) purchases. That declared
  total is used as a reconciliation oracle (see `reconcile_declared_total`) —
  there is no running balance, but this labelled total serves the same purpose.

- Amounts are Colombian notation: `.` thousands, `,` decimals (`$149.054,00`).
- Dates are already ISO (YYYY-MM-DD); no statement-period year inference.
"""

import re

import pdfplumber

from app.schemas import ParseResult, RawTransaction
from app.parsers.base import parse_amount, reconcile_declared_total

SIGNATURE = "Rappi"

# `Tarjeta ISO-date description $VALUE $CAPITAL k de N ...`. Capturing the
# cuota index lets us keep only this-period purchases (`1 de N`). Payment rows
# print `N/A` where `$CAPITAL k de N` is expected, so they never match.
_ROW = re.compile(
    r"^(?:Virtual|Fisica|-)\s+(\d{4}-\d{2}-\d{2})\s+(.*?)\s*"
    r"\$\s*(-?\d[\d.]*,\d{2})\s+\$\s*-?\d[\d.]*,\d{2}\s+(\d+) de \d+"
)

_DECLARED_CONSUMOS = re.compile(r"\bConsumos del mes\s*\$\s*([\d.]+,\d{2})")


def _amount(raw: str) -> float:
    return parse_amount(raw, decimal_sep=",", thousands_sep=".")


def _declared_total(first_page_text: str) -> float | None:
    match = _DECLARED_CONSUMOS.search(first_page_text)
    return _amount(match.group(1)) if match else None


def parse(pdf: "pdfplumber.PDF") -> ParseResult:
    pages_text = [page.extract_text() or "" for page in pdf.pages]
    if not pages_text:
        return ParseResult(
            transactions=[], reconciliation=reconcile_declared_total([], None)
        )

    declared_total = _declared_total(pages_text[0])

    transactions: list[RawTransaction] = []
    magnitudes: list[float] = []
    for page_text in pages_text:
        for raw_line in page_text.splitlines():
            match = _ROW.match(raw_line.strip())
            if not match:
                continue
            iso_date, description, value_str, cuota_index = match.groups()
            if int(cuota_index) != 1:
                # Prior-period installment re-listed this month — skip.
                continue

            amount = abs(_amount(value_str))
            magnitudes.append(amount)
            # Every kept row is a card purchase: store as a signed EXPENSE,
            # matching the backend's signed-value dedup convention.
            transactions.append(
                RawTransaction(
                    date=iso_date,
                    description=description.strip(),
                    value=-amount,
                    type="expenses",
                    categoryName="",
                    rawLine=raw_line.strip(),
                )
            )

    reconciliation = reconcile_declared_total(magnitudes, declared_total)
    return ParseResult(transactions=transactions, reconciliation=reconciliation)
