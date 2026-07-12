"""Shared parser protocol and amount/date normalizers.

`parse_amount` and `parse_date` are parameterized per bank (decimal/thousands
separators, date format) so each bank module only supplies its own
constants and column/line logic.
"""

from datetime import date
from typing import Protocol

from app.schemas import RawTransaction


class BankParser(Protocol):
    def __call__(self, pdf: "pdfplumber.PDF") -> list[RawTransaction]:  # noqa: F821
        ...


def parse_amount(raw: str, decimal_sep: str = ".", thousands_sep: str = ",") -> float:
    """Parse a signed amount string into a float.

    Examples (decimal_sep=".", thousands_sep=","):
        "4,161,550.40"  -> 4161550.40
        "-120,000.00"   -> -120000.00
        "3.38"          -> 3.38
    """
    cleaned = raw.strip().replace(thousands_sep, "")
    if decimal_sep != ".":
        cleaned = cleaned.replace(decimal_sep, ".")
    return float(cleaned)


def parse_date(day: int, month: int, year: int) -> str:
    """Return an ISO yyyy-mm-dd string for the given day/month/year."""
    return date(year, month, day).isoformat()


def resolve_year(day: int, month: int, statement_from: date, statement_to: date) -> int:
    """Resolve the calendar year for a `day/month`-only transaction date.

    Bank statements print transaction dates without a year, relying on the
    statement's own DESDE/HASTA period. If the period spans a single
    calendar year, that year applies to every row. If the period crosses a
    year boundary (e.g. Dec -> Jan), the transaction's year is inferred by
    comparing its month against the boundary month.
    """
    if statement_from.year == statement_to.year:
        return statement_from.year
    # Year boundary crossing: months >= the "from" month belong to the
    # "from" year, months < it belong to the "to" year.
    if month >= statement_from.month:
        return statement_from.year
    return statement_to.year
