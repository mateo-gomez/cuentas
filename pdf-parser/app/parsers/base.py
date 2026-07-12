"""Shared parser protocol and amount/date normalizers.

`parse_amount` and `parse_date` are parameterized per bank (decimal/thousands
separators, date format) so each bank module only supplies its own
constants and column/line logic.
"""

from datetime import date
from typing import Protocol

from app.schemas import ParseResult, RawTransaction, Reconciliation


class BankParser(Protocol):
    def __call__(self, pdf: "pdfplumber.PDF") -> ParseResult:  # noqa: F821
        ...


def reconcile_running_balance(pairs: list[tuple[float, float]]) -> Reconciliation:
    """Reconcile a statement's running balance against parsed transactions.

    `pairs` is `[(value, saldo), ...]` in statement order, where `saldo` is
    the running balance printed on each row. Math is done in integer cents
    (`round(value * 100)`) to avoid IEEE-754 float drift; tolerance is 1
    cent. Returns `available=False` when there are no rows to reconcile
    (see design Decision 2/3).
    """
    if not pairs:
        return Reconciliation(available=False)

    first_value, first_saldo = pairs[0]
    last_saldo = pairs[-1][1]

    opening_balance = first_saldo - first_value
    closing_balance = last_saldo

    computed_delta_cents = sum(round(value * 100) for value, _saldo in pairs)
    expected_delta_cents = round(closing_balance * 100) - round(opening_balance * 100)
    difference_cents = computed_delta_cents - expected_delta_cents

    return Reconciliation(
        available=True,
        reconciled=abs(difference_cents) <= 1,
        openingBalance=opening_balance,
        closingBalance=closing_balance,
        computedDelta=computed_delta_cents / 100,
        expectedDelta=expected_delta_cents / 100,
        difference=difference_cents / 100,
    )


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
