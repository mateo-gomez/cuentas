import pdfplumber
import pytest

from app.parsers import davibank


@pytest.fixture(scope="module")
def parse_result(davibank_pdf):
    with pdfplumber.open(davibank_pdf) as pdf:
        return davibank.parse(pdf)


@pytest.fixture(scope="module")
def transactions(parse_result):
    return parse_result.transactions


def test_extracts_expected_transaction_count(transactions):
    # 9 "periodo facturado" purchases + 1 first-installment purchase listed under
    # "periodos anteriores" (SR WOK 1/24) + 2 "Otros cargos" fees.
    assert len(transactions) == 12


def test_all_rows_are_expenses_with_negative_signed_value(transactions):
    # A credit-card charge is spend: stored as a signed expense so it matches
    # the backend's signed-value dedup convention.
    for tx in transactions:
        assert tx.type == "expenses"
        assert tx.value < 0


def test_every_row_has_iso_date(transactions):
    for tx in transactions:
        assert len(tx.date) == 10 and tx.date[4] == "-" and tx.date[7] == "-"


def test_first_period_transaction_matches_known_fixture_row(transactions):
    first = transactions[0]
    assert first.date == "2026-06-09"
    assert first.description == "TIENDA D1 SAB AVES MARI"
    assert first.value == pytest.approx(-67330.0)


def test_period_row_with_empty_description_is_still_imported(transactions):
    # 07/06/2026 has no merchant description in the sample; the value must
    # still be captured (anchored on the trailing column structure) and the
    # missing description backfilled so the row stays importable downstream.
    row = next(t for t in transactions if t.date == "2026-06-07")
    assert row.description == "Sin descripción"
    assert row.value == pytest.approx(-79851.0)


def test_first_installment_under_prior_periods_section_is_imported(transactions):
    # SR WOK is printed under "Transacciones de periodos anteriores" but its
    # cuota is 1/24 — a NEW purchase this period — so it MUST be imported.
    # (The declared "Valor transacciones del periodo" total proves it counts.)
    row = next(t for t in transactions if t.description == "SR WOK VIVA ENVIGADO")
    assert row.date == "2026-05-15"
    assert row.value == pytest.approx(-61900.0)


def test_otros_cargos_fees_are_imported_as_expenses(transactions):
    fees = {t.description: t.value for t in transactions if t.date == "2026-06-12"}
    assert fees["SEGURO DE VIDA OBLIGATORIO"] == pytest.approx(-5490.0)
    assert fees["CUOTA DE MANEJO MENSUAL"] == pytest.approx(-47926.0)


def test_payments_and_ongoing_installments_are_excluded(transactions):
    # "Tus pagos y abonos" (GRACIAS POR SU PAGO) and ongoing installments
    # (UNIFICACION DEUDAS, 14/24) must never be imported.
    descriptions = {t.description for t in transactions}
    assert not any("GRACIAS POR SU PAGO" in d for d in descriptions)
    assert "UNIFICACION DEUDAS" not in descriptions


def test_category_name_left_empty(transactions):
    assert all(tx.categoryName == "" for tx in transactions)


def test_reconciles_against_declared_valor_transacciones_del_periodo(parse_result):
    # Sum of imported purchases (fees excluded) equals the statement's declared
    # "+ Valor transacciones del periodo $ 502.207".
    recon = parse_result.reconciliation
    assert recon.available is True
    assert recon.reconciled is True
    assert recon.computedDelta == pytest.approx(502207.0)
    assert recon.expectedDelta == pytest.approx(502207.0)
