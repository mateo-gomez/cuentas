import pdfplumber

from app.identify import identify_bank


def _page1_text(path: str) -> str:
    with pdfplumber.open(path) as pdf:
        return pdf.pages[0].extract_text() or ""


def test_identifies_bancolombia_from_real_fixture(bancolombia_pdf):
    text = _page1_text(bancolombia_pdf)
    assert identify_bank(text) == "bancolombia"


def test_returns_none_on_unknown_signature():
    assert identify_bank("Some random PDF text with no bank signature at all.") is None


def test_returns_none_on_ambiguous_match():
    ambiguous_text = "ESTADO DE CUENTA ... Extracto de tu tarjeta de crédito ... Rappi"
    assert identify_bank(ambiguous_text) is None


def test_identifies_davibank_signature():
    assert identify_bank("Extracto de tu tarjeta de crédito CCCCoooonnnn") == "davibank"


def test_identifies_rappi_signature():
    assert identify_bank("Producto emitido por Davivienda S.A. ... Rappi") == "rappi"
