import pdfplumber
import pytest

from app.parsers import rappi


@pytest.fixture(scope="module")
def parse_result(rappi_pdf):
    with pdfplumber.open(rappi_pdf) as pdf:
        return rappi.parse(pdf)


@pytest.fixture(scope="module")
def transactions(parse_result):
    return parse_result.transactions


def test_extracts_only_this_period_purchases(transactions):
    # 11 "1 de N" purchases. Prior-period installments (k>1) and the
    # "PAGOS POR PSE" payment (N/A cuotas) are excluded.
    assert len(transactions) == 11


def test_all_rows_are_expenses_with_negative_signed_value(transactions):
    for tx in transactions:
        assert tx.type == "expenses"
        assert tx.value < 0


def test_every_row_has_iso_date(transactions):
    for tx in transactions:
        assert len(tx.date) == 10 and tx.date[4] == "-" and tx.date[7] == "-"


def test_prior_period_installments_are_excluded(transactions):
    # COMPRA DE CARTERA (7 de 14), MERCADO PAGO (8 de 9), MERCADO PAGO*MERCADOLI
    # (5 de 6) are ongoing installments from prior months — must be skipped.
    descriptions = {t.description for t in transactions}
    assert "COMPRA DE CARTERA" not in descriptions
    assert all("MERCADO" not in d for d in descriptions)
    # And every kept row is dated within the current billing period.
    assert all(t.date.startswith("2026-04") for t in transactions)


def test_payment_row_is_excluded(transactions):
    descriptions = {t.description for t in transactions}
    assert not any("PAGOS POR PSE" in d for d in descriptions)


def test_known_purchase_row_matches_fixture(transactions):
    row = next(t for t in transactions if t.description == "CLAUDE.AI SUBSCRIPTION")
    assert row.date == "2026-04-04"
    assert row.value == pytest.approx(-75354.07)


def test_reconciles_against_declared_consumos_del_mes(parse_result):
    # The sum of imported purchases equals the statement's declared
    # "+ Consumos del mes $2.207.660,07" — the credit-card reconciliation oracle.
    recon = parse_result.reconciliation
    assert recon.available is True
    assert recon.reconciled is True
    assert recon.computedDelta == pytest.approx(2207660.07)
    assert recon.expectedDelta == pytest.approx(2207660.07)


def test_category_name_left_empty(transactions):
    assert all(tx.categoryName == "" for tx in transactions)
