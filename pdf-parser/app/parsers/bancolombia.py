"""Bancolombia "ESTADO DE CUENTA" (savings account) parser.

Calibrated against the anonymized sample at
`pdf-parser/tests/fixtures/bancolombia.pdf`. Layout observed with pdfplumber:

- Header on every page: "ESTADO DE CUENTA" + "DESDE: yyyy/mm/dd HASTA: yyyy/mm/dd"
- Transaction table header line: "FECHA DESCRIPCIÓN SUCURSAL DCTO. VALOR SALDO"
- One transaction per text line, in a single-column layout (no pdfplumber
  table extraction needed — plain `extract_text()` lines are reliable):

      D/MM DESCRIPTION VALUE SALDO
      1/04 ABONO INTERESES AHORROS 3.38 4,161,550.40
      1/04 TRANSFERENCIAS A NEQUI -120,000.00 4,041,550.40

  `VALUE` is a single signed column (US-style notation: comma thousands
  separator, period decimal separator) — positive values are credits
  ("abonos"), negative values are debits ("cargos"). There is no separate
  debit/credit column to reconcile: the sign IS the bank's own convention,
  so `type` is derived directly from it (not a re-derivation/guess like the
  Excel importer's always-expense bug — see design Decision 3).
- `SALDO` (running balance) is always positive and is NOT emitted as a
  transaction field; it's used only to help delimit the VALUE column via
  the trailing-two-numbers regex.
- Footer noise per page: "DCF:defensor@bancolombia.com.co;..." and
  "PÁGINA: N" — skipped.
- Final page ends with "FIN ESTADO DE CUENTA".
"""

import re
from datetime import date

import pdfplumber

from app.schemas import ParseResult, RawTransaction
from app.parsers.base import parse_amount, reconcile_running_balance, resolve_year

PERIOD_RE = re.compile(
    r"DESDE:\s*(\d{4})/(\d{2})/(\d{2})\s+HASTA:\s*(\d{4})/(\d{2})/(\d{2})"
)

# `date  description  value  saldo`. pdfplumber's `extract_text()` renders
# the whole line with plain single-space word separators (it does NOT
# preserve the underlying column gaps as multi-space runs for this
# statement layout), so the value/saldo boundary can't be anchored on
# whitespace width. Instead it is anchored deterministically on the two
# RIGHTMOST whitespace-separated tokens of the line (`value` then `saldo`),
# via `_split_description_value_saldo` below, which is immune to a
# description that itself contains money-shaped tokens (merchant refs,
# invoice numbers) near the end — those can only ever land in the
# description group, never be mistaken for the trailing value/saldo pair.
DAY_MONTH_RE = re.compile(r"^(?P<day>\d{1,2})/(?P<month>\d{2})\s+(?P<rest>.+)$")
MONEY_RE = re.compile(r"^-?(?:\d[\d,]*)?\.\d{2}$")

SIGNATURE = "ESTADO DE CUENTA"
BANK_SIGNATURE_HINTS = ("bancolombia", "ESTADO DE CUENTA")


def _extract_period(first_page_text: str) -> tuple[date, date]:
    match = PERIOD_RE.search(first_page_text)
    if not match:
        raise ValueError("Bancolombia statement is missing the DESDE/HASTA period header")
    fy, fm, fd, ty, tm, td = (int(g) for g in match.groups())
    return date(fy, fm, fd), date(ty, tm, td)


def _split_description_value_saldo(rest: str) -> tuple[str, str, str] | None:
    """Split the `description value saldo` remainder of a line.

    The value and saldo are the two RIGHTMOST whitespace-separated tokens,
    determined by position (not by "does it look like a number") and then
    validated against `MONEY_RE`. This keeps a description that happens to
    contain money-shaped tokens (e.g. "COMPRA REF 12.34 ALMACEN") from being
    mis-split: those tokens can only ever end up inside the description,
    since only the true trailing pair is ever consulted.
    """
    tokens = rest.split()
    if len(tokens) < 3:
        return None

    saldo_str = tokens[-1]
    value_str = tokens[-2]

    if not MONEY_RE.match(value_str) or not MONEY_RE.match(saldo_str):
        return None

    description = " ".join(tokens[:-2]).strip()
    if not description:
        return None

    return description, value_str, saldo_str


def parse(pdf: "pdfplumber.PDF") -> ParseResult:
    pages_text = [page.extract_text() or "" for page in pdf.pages]
    if not pages_text:
        return ParseResult(transactions=[], reconciliation=reconcile_running_balance([]))

    statement_from, statement_to = _extract_period(pages_text[0])

    transactions: list[RawTransaction] = []
    balance_pairs: list[tuple[float, float]] = []
    for page_text in pages_text:
        for raw_line in page_text.splitlines():
            line = raw_line.strip()
            date_match = DAY_MONTH_RE.match(line)
            if not date_match:
                continue

            split = _split_description_value_saldo(date_match.group("rest"))
            if not split:
                continue
            description, value_str, saldo_str = split

            day = int(date_match.group("day"))
            month = int(date_match.group("month"))
            value = parse_amount(value_str)
            saldo = parse_amount(saldo_str)

            year = resolve_year(day, month, statement_from, statement_to)
            iso_date = date(year, month, day).isoformat()

            transactions.append(
                RawTransaction(
                    date=iso_date,
                    description=description,
                    value=value,
                    type="income" if value >= 0 else "expenses",
                    categoryName="",
                    rawLine=line,
                )
            )
            balance_pairs.append((value, saldo))

    reconciliation = reconcile_running_balance(balance_pairs)
    return ParseResult(transactions=transactions, reconciliation=reconciliation)
