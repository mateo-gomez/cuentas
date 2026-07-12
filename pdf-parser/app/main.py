"""FastAPI app — the PDF bank statement extraction microservice.

Node never parses PDFs itself; it forwards bytes here over the trusted
internal network (`POST /parse`) and receives the typed `ParseResponse`
contract, or a structured 422 error (see spec: "Domain: Node<->Python JSON
Contract").
"""

import io

import pdfplumber
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.identify import identify_bank
from app.parsers import PARSERS
from app.schemas import ErrorResponse, ParseResponse

MAX_PAGES = 50

app = FastAPI(title="pdf-parser", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/parse", response_model=ParseResponse, responses={422: {"model": ErrorResponse}})
async def parse_pdf(file: UploadFile) -> ParseResponse | JSONResponse:
    raw_bytes = await file.read()

    with pdfplumber.open(io.BytesIO(raw_bytes)) as pdf:
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
