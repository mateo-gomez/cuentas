"""Davibank "Extracto de tu tarjeta de crédito" (credit card) parser.

Calibrated against the anonymized sample at repo-root `.samples/davibank.pdf`.
Unlike the Bancolombia SAVINGS statement, this is a CREDIT CARD statement, so
the layout and semantics differ (and mirror the Rappi credit-card parser):

- There is NO running account balance ("SALDO") column. The per-row "Saldo
  pendiente" is remaining installment capital, not a running balance.

- What counts as "a purchase made THIS period" is the installment index in the
  "Cuotas" column (`k/N`), NOT the section header a row is printed under:
    * `k == 1` -> first (or only) installment = a purchase made this period.
    * `k > 1`  -> a prior-period purchase, re-listed for its installment this
      month (already imported in its own month) — SKIP.
  This is verified against the statement's own declared total: the sum of the
  imported `k == 1` purchases equals "+ Valor transacciones del periodo".
  Crucially a brand-new purchase in many installments (e.g. `1/24`) is printed
  under "Transacciones de periodos anteriores" yet still counts this period, so
  BOTH transaction sections are scanned and filtered by the cuota index.

- Two sections are deliberately SKIPPED entirely:
    * "Tus pagos y abonos" — payments TO the card (recorded on the funding
      account; importing them would double-count). Section scoping is REQUIRED,
      not cosmetic: a payment row ends in a money token too, so without it the
      fee regex would mis-import a payment as an expense.

- Imported rows, all EXPENSES:
    * Purchase rows (both transaction sections, `k == 1`).
    * "Otros cargos" fee rows (insurance, monthly handling) — real spend, no
      installment column.

- Purchase row layout (single-space flattened by `extract_text`):
      DD/MM/AAAA  <comprobante>  <description?>  $ VALUE  k/N  $ CAPITAL  $ SALDO  MV%  EA%
      09/06/2026 783817 TIENDA D1 SAB AVES MARI $ 67.330 1/1 $ 67.330 $ 0 2,10% 28,45%
  The description CAN be empty. VALUE is anchored on the deterministic trailing
  column structure so a money-shaped token inside the description can never be
  mistaken for the transaction value.
- Fee row layout: `DD/MM/AAAA  <description>  $ VALUE` (single trailing money).

- Reconciliation: the sum of imported purchases (fees excluded — they are a
  separate declared bucket) is checked against the page-1 declared total
  "+ Valor transacciones del periodo $X" via `reconcile_declared_total`.

- Amounts are Colombian notation: `.` thousands, `,` decimals (`$ 1.234.567,89`).
- Dates are fully qualified (DD/MM/AAAA), so no statement-period year inference.
"""

import re
from datetime import date

import pdfplumber

from app.schemas import ParseResult, RawTransaction
from app.parsers.base import parse_amount, reconcile_declared_total

SIGNATURE = "Extracto de tu tarjeta de crédito"

# Section headers (substring match). Both transaction sections are scanned for
# purchases (filtered by cuota index); "Otros cargos" holds fees; payments are
# skipped.
_SECTION_HEADERS: tuple[tuple[str, str], ...] = (
    ("Transacciones del periodo facturado", "TXN"),
    ("Transacciones de periodos anteriores", "TXN"),
    ("Tus pagos y abonos", "SKIP"),
    ("Otros cargos", "FEES"),
)

# Purchase row: date, comprobante, optional description, value, then the cuota
# index — all anchored on the trailing `$CAPITAL $SALDO MV% EA%` column tail.
_TXN_ROW = re.compile(
    r"^(\d{2})/(\d{2})/(\d{4})\s+\d+\s+(.*?)\s*"
    r"\$\s*(-?[\d.,]+)\s+(\d+)/\d+\s+\$\s*-?[\d.,]+\s+\$\s*-?[\d.,]+\s+[\d,]+%\s+[\d,]+%$"
)

# Fee row: date, description, single trailing money value.
_FEE_ROW = re.compile(r"^(\d{2})/(\d{2})/(\d{4})\s+(.*?)\s*\$\s*(-?[\d.,]+)$")

_DECLARED_PERIOD_TOTAL = re.compile(
    r"Valor transacciones del periodo\s*\$\s*([\d.]+(?:,\d{2})?)"
)


def _amount(raw: str) -> float:
    return parse_amount(raw, decimal_sep=",", thousands_sep=".")


def _iso(day: str, month: str, year: str) -> str:
    return date(int(year), int(month), int(day)).isoformat()


def _declared_period_total(first_page_text: str) -> float | None:
    match = _DECLARED_PERIOD_TOTAL.search(first_page_text)
    return _amount(match.group(1)) if match else None


def _expense(iso_date: str, description: str, amount: float, raw: str) -> RawTransaction:
    # Every imported row is a card charge: store as a signed EXPENSE (negative
    # magnitude), matching the backend's signed-value dedup convention.
    return RawTransaction(
        date=iso_date,
        description=description.strip(),
        value=-abs(amount),
        type="expenses",
        categoryName="",
        rawLine=raw,
    )


def parse(pdf: "pdfplumber.PDF") -> ParseResult:
    pages_text = [page.extract_text() or "" for page in pdf.pages]
    declared_total = (
        _declared_period_total(pages_text[0]) if pages_text else None
    )

    transactions: list[RawTransaction] = []
    purchase_magnitudes: list[float] = []
    section: str | None = None

    for page_text in pages_text:
        for raw_line in page_text.splitlines():
            line = raw_line.strip()

            for marker, target in _SECTION_HEADERS:
                if marker in line:
                    section = target
                    break

            if section == "TXN":
                match = _TXN_ROW.match(line)
                if not match:
                    continue
                d, m, y, description, value_str, cuota_index = match.groups()
                if int(cuota_index) != 1:
                    # Prior-period installment re-listed this month — skip.
                    continue
                amount = abs(_amount(value_str))
                purchase_magnitudes.append(amount)
                transactions.append(_expense(_iso(d, m, y), description, amount, line))
            elif section == "FEES":
                match = _FEE_ROW.match(line)
                if not match:
                    continue
                d, m, y, description, value_str = match.groups()
                amount = abs(_amount(value_str))
                transactions.append(_expense(_iso(d, m, y), description, amount, line))

    reconciliation = reconcile_declared_total(purchase_magnitudes, declared_total)
    return ParseResult(transactions=transactions, reconciliation=reconciliation)
