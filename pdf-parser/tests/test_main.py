import io

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


# A minimal, hand-built valid single-page PDF with no text content at all —
# small enough to inline, avoids pulling in a PDF-writing dependency just for
# this one test. pdfplumber can open it and `extract_text()` returns "".
_BLANK_PDF = b"""%PDF-1.1
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >> endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer << /Size 4 /Root 1 0 R >>
startxref
190
%%EOF"""


def _make_minimal_pdf(_text: str) -> bytes:
    return _BLANK_PDF


def test_parse_bancolombia_fixture_returns_transactions(bancolombia_pdf):
    with open(bancolombia_pdf, "rb") as f:
        response = client.post(
            "/parse", files={"file": ("bancolombia.pdf", f, "application/pdf")}
        )

    assert response.status_code == 200
    body = response.json()
    assert body["bankId"] == "bancolombia"
    assert len(body["transactions"]) == 181
    first = body["transactions"][0]
    assert first["date"] == "2026-04-01"
    assert first["type"] == "income"


def test_parse_unrecognized_bank_returns_422():
    pdf_bytes = _make_minimal_pdf("Totally unrelated document with no bank signature")

    response = client.post(
        "/parse", files={"file": ("unknown.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    )

    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "unrecognized_bank"
