import pdfplumber
import pytest

from app.parsers import bancolombia


@pytest.fixture(scope="module")
def transactions(bancolombia_pdf):
    with pdfplumber.open(bancolombia_pdf) as pdf:
        return bancolombia.parse(pdf)


def test_extracts_expected_transaction_count(transactions):
    # Calibrated against the real anonymized fixture: 181 rows across 4 pages,
    # including the "-.01" edge case (AJUSTE INTERES AHORROS DB) that has no
    # leading digit before the decimal point.
    assert len(transactions) == 181


def test_every_row_has_iso_date_and_non_empty_description(transactions):
    for tx in transactions:
        assert len(tx.date) == 10 and tx.date[4] == "-" and tx.date[7] == "-"
        assert tx.description.strip() != ""


def test_type_is_derived_from_signed_value_not_guessed(transactions):
    for tx in transactions:
        if tx.value >= 0:
            assert tx.type == "income"
        else:
            assert tx.type == "expenses"


def test_first_transaction_matches_known_fixture_row(transactions):
    first = transactions[0]
    assert first.date == "2026-04-01"
    assert first.description == "ABONO INTERESES AHORROS"
    assert first.value == pytest.approx(3.38)
    assert first.type == "income"


def test_last_transaction_matches_known_fixture_row(transactions):
    last = transactions[-1]
    assert last.date == "2026-06-30"
    assert last.description == "TRANSFERENCIA CTA SUC VIRTUAL"
    assert last.value == pytest.approx(-300000.00)
    assert last.type == "expenses"


def test_handles_value_with_no_leading_integer_digit(transactions):
    adjustment = next(
        t for t in transactions if t.description == "AJUSTE INTERES AHORROS DB"
    )
    assert adjustment.value == pytest.approx(-0.01)
    assert adjustment.type == "expenses"
    assert adjustment.date == "2026-05-14"


def test_income_and_expense_counts(transactions):
    income = sum(1 for t in transactions if t.type == "income")
    expenses = sum(1 for t in transactions if t.type == "expenses")
    assert income == 88
    assert expenses == 93
    assert income + expenses == len(transactions)


def test_category_name_left_empty(transactions):
    assert all(tx.categoryName == "" for tx in transactions)


def test_split_does_not_mis_split_on_money_shaped_description_tokens():
    # A description containing embedded money-shaped tokens (a merchant
    # reference and an invoice number, both real-world Colombian statement
    # noise) must not be confused with the trailing value/saldo pair — only
    # the two RIGHTMOST tokens are ever treated as value/saldo.
    rest = "COMPRA REF 12.34 ALMACEN -50,000.00 4,000,000.00"
    result = bancolombia._split_description_value_saldo(rest)

    assert result == ("COMPRA REF 12.34 ALMACEN", "-50,000.00", "4,000,000.00")


def test_split_returns_none_when_trailing_tokens_are_not_money_shaped():
    assert bancolombia._split_description_value_saldo("SOME TEXT WITHOUT AMOUNTS") is None
