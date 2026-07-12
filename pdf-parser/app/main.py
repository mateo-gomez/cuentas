"""FastAPI app — the PDF bank statement extraction microservice.

Node never parses PDFs itself; it forwards bytes here over the trusted
internal network (`POST /parse`) and receives the typed `ParseResponse`
contract, or a structured 422 error (see spec: "Domain: Node<->Python JSON
Contract").
"""

import io

import pdfplumber
from fastapi import FastAPI, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.identify import identify_bank
from app.parsers import PARSERS
from app.schemas import ErrorResponse, ParseResponse

MAX_PAGES = 50

app = FastAPI(title="pdf-parser", version="0.1.0")


def _is_password_error(exc: BaseException) -> bool:
    """Walk the exception chain looking for pdfminer's password/encryption
    errors. pdfplumber wraps the original in `PdfminerException`, so the real
    cause can hide in `__cause__`, `__context__`, or `args[0]`."""
    seen: set[int] = set()
    current: BaseException | None = exc

    while current is not None and id(current) not in seen:
        seen.add(id(current))

        if type(current).__name__ in {"PDFPasswordIncorrect", "PDFEncryptionError"}:
            return True

        nxt = current.__cause__ or current.__context__
        if nxt is None and getattr(current, "args", None):
            first = current.args[0]
            if isinstance(first, BaseException):
                nxt = first
        current = nxt

    return False


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/parse", response_model=ParseResponse, responses={422: {"model": ErrorResponse}})
async def parse_pdf(
    file: UploadFile,
    password: str | None = Form(default=None),
) -> ParseResponse | JSONResponse:
    raw_bytes = await file.read()

    try:
        pdf = pdfplumber.open(io.BytesIO(raw_bytes), password=password or "")
    except Exception as exc:  # noqa: BLE001 - inspected below
        if _is_password_error(exc):
            return JSONResponse(
                status_code=422,
                content=ErrorResponse(
                    code="password_required",
                    message="El PDF está protegido con contraseña.",
                ).model_dump(),
            )
        raise HTTPException(status_code=500, detail=f"open_error: {exc}") from exc

    with pdf:
        if len(pdf.pages) > MAX_PAGES:
            return JSONResponse(
                status_code=422,
                content=ErrorResponse(
                    code="too_many_pages",
                    message=f"PDF exceeds the {MAX_PAGES}-page limit",
                ).model_dump(),
            )

        if not pdf.pages:
            return JSONResponse(
                status_code=422,
                content=ErrorResponse(
                    code="unrecognized_bank",
                    message="PDF has no pages to identify",
                ).model_dump(),
            )

        page1_text = pdf.pages[0].extract_text() or ""
        bank_id = identify_bank(page1_text)

        if bank_id is None:
            return JSONResponse(
                status_code=422,
                content=ErrorResponse(
                    code="unrecognized_bank",
                    message="Could not identify the bank from the statement",
                ).model_dump(),
            )

        parser = PARSERS[bank_id]

        try:
            parse_result = parser(pdf)
        except NotImplementedError as exc:
            return JSONResponse(
                status_code=422,
                content=ErrorResponse(
                    code="unrecognized_bank",
                    message=str(exc),
                ).model_dump(),
            )
        except Exception as exc:  # pragma: no cover - defensive
            raise HTTPException(status_code=500, detail=f"parse_error: {exc}") from exc

    return ParseResponse(
        bankId=bank_id,
        transactions=parse_result.transactions,
        warnings=[],
        reconciliation=parse_result.reconciliation,
    )
