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


def test_imports_every_non_payment_row(transactions):
    # 14 movement rows charge the period: 11 one-shot purchases plus three
    # deferred installments (COMPRA DE CARTERA, MERCADO PAGO, MERCADO
    # PAGO*MERCADOLI). Only the "PAGOS POR PSE" payment (N/A cuotas) is excluded.
    assert len(transactions) == 14


def test_all_rows_are_expenses_with_negative_signed_value(transactions):
    for tx in transactions:
        assert tx.type == "expenses"
        assert tx.value < 0


def test_every_row_has_iso_date(transactions):
    for tx in transactions:
        assert len(tx.date) == 10 and tx.date[4] == "-" and tx.date[7] == "-"


def test_deferred_installments_are_imported_at_period_capital(transactions):
    # Prior-period installments are now imported, valued at column 5 "Capital
    # facturado del periodo" (the current month's charge), not the full purchase.
    cartera = next(t for t in transactions if t.description == "COMPRA DE CARTERA")
    assert cartera.value == pytest.approx(-278556.16)  # not the $8.235.000 total


def test_prior_period_installments_dated_to_period_end(transactions):
    # A deferred purchase's monthly charge belongs to the current billing
    # period, so its row is re-dated to the statement's "Hasta 29 abr 2026"
    # end date, not the original 2025 purchase date.
    for desc in ("COMPRA DE CARTERA", "MERCADO PAGO", "MERCADO PAGO*MERCADOLI"):
        row = next(t for t in transactions if t.description == desc)
        assert row.date == "2026-04-29"


def test_current_period_purchases_keep_their_real_date(transactions):
    # A first-installment purchase (ALKOMPRAR, 1 de 2) happened this period —
    # its real date is preserved, not moved to the period end.
    row = next(t for t in transactions if t.description == "ALKOMPRAR MAYORCA")
    assert row.date == "2026-04-10"


def test_multiline_description_is_reconstructed(transactions):
    # A merchant name wrapped across two visual sub-lines must be rebuilt whole,
    # never dropped as "Sin descripción".
    descriptions = {t.description for t in transactions}
    assert "MERCADO PAGO*MERCADOLI" in descriptions
    assert "Sin descripción" not in descriptions


def test_payment_row_is_excluded(transactions):
    descriptions = {t.description for t in transactions}
    assert not any("PAGOS POR PSE" in d for d in descriptions)


def test_installment_purchase_uses_period_capital_not_total(transactions):
    # ALKOMPRAR MAYORCA is a 1-de-2 purchase: total $1.639.050, but only
    # $819.525 (column 5) is charged this period.
    row = next(t for t in transactions if t.description == "ALKOMPRAR MAYORCA")
    assert row.value == pytest.approx(-819525.00)


def test_one_shot_purchase_matches_fixture(transactions):
    row = next(t for t in transactions if t.description == "CLAUDE.AI SUBSCRIPTION")
    assert row.date == "2026-04-04"
    assert row.value == pytest.approx(-75354.07)


def test_reconciles_against_declared_capital_facturado(parse_result):
    # The sum of imported period-capital charges equals the statement's declared
    # "+ Capital facturado consumos del mes $1.839.725,55".
    recon = parse_result.reconciliation
    assert recon.available is True
    assert recon.reconciled is True
    assert recon.computedDelta == pytest.approx(1839725.55)
    assert recon.expectedDelta == pytest.approx(1839725.55)


def test_category_name_left_empty(transactions):
    assert all(tx.categoryName == "" for tx in transactions)
