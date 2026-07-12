# pdf-parser

Python FastAPI + pdfplumber microservice that deterministically extracts
transactions from bank statement PDFs (Bancolombia, Davibank, Rappi). No
LLM involved — bank identification and parsing are both rule-based.

Node never parses PDFs itself: it forwards the uploaded bytes here over the
trusted internal network and receives a typed JSON contract (or a
structured 422 error). See `sdd/pdf-bank-import/design` for the full
architecture rationale.

## Run

```bash
cd pdf-parser
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Or from the repo root: `npm run parser:dev`.

## Test

```bash
cd pdf-parser
pytest
```

## Endpoints

- `POST /parse` — multipart `file` (application/pdf) → `ParseResponse`
  (`{ bankId, transactions[], warnings[] }`) or a 422 `ErrorResponse`
  (`{ code: "unrecognized_bank" | "too_many_pages" | "parse_error", message }`)
- `GET /health` — liveness check

## Supported banks

| Bank | Status |
|------|--------|
| Bancolombia (savings account "ESTADO DE CUENTA") | Calibrated — full parser |
| Davibank (credit card) | Registered in the dispatcher only — `NotImplementedError`, follow-up work |
| Rappi (Davivienda-issued credit card) | Registered in the dispatcher only — `NotImplementedError`, follow-up work |

## Fixtures

`tests/fixtures/bancolombia.pdf` is a copy of the anonymized sample provided
for this change (`.samples/bancolombia.pdf` at the repo root) — account
numbers, names, and branch info are redacted (`xxxx`/`0000...`); transaction
dates, descriptions, and amounts are real statement data used to calibrate
and regression-test the parser.

## Deploy notes

Runs as an independent process/container alongside the Node backend and
Expo app (see root `package.json` dev scripts). The Node backend reads its
base URL from `PDF_PARSER_URL` (server-side only — never exposed to the RN
app). If this service is down, Node's `/transactions/import/pdf` returns a
retryable 502/504; the Excel import and manual entry flows are unaffected.
