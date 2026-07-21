# cuentas

Personal finance app: track expenses and income, manage accounts and categories,
and import bank statements (Excel / PDF) with automatic transaction categorization.

## Architecture

Monorepo with three workspaces:

- **`cuentas/`** — React Native (Expo) mobile app. Also runs on web via `react-native-web`.
- **`backend/`** — Node.js / Express API in TypeScript, following Clean Architecture per feature.
- **`pdf-parser/`** — Python (FastAPI + pdfplumber) microservice that parses bank-statement PDFs.

`docker-compose.yml` wires `backend` + `pdf-parser`; `render.yaml` deploys them.

## Features

- Expenses, income and account-to-account transfers (no double-counting on card payments)
- Accounts and categories, all scoped per user (JWT auth)
- Bank-statement import:
  - **Excel** — parsed in-process
  - **PDF** — forwarded to the `pdf-parser` service (rule-based, no LLM). Calibrated for
    Bancolombia, Davibank and RappiPay. Encrypted PDFs supported end-to-end.
- Runtime theming (Claro / Oscuro / Auto) with WCAG-checked palettes

## Setup

```bash
# app
cp cuentas/.env.example cuentas/.env

# backend
cp backend/.env.example backend/.env
```

`EXPO_PUBLIC_API_URL` must be your machine's LAN IP — not `localhost` or `127.0.0.1`
(a physical device can't reach those).

`PDF_PARSER_URL` (backend `.env`, server-side only) points Node at the Python parser.
If the parser is down, PDF import returns a retryable error; Excel import and manual
entry are unaffected.

## Install & run

### App (`cuentas/`)

```bash
cd cuentas && npm install
npx expo start
```

### Backend (`backend/`)

```bash
cd backend && npm install
npm run dev        # ts-node-dev with hot reload
npm test           # jest
```

### PDF parser (`pdf-parser/`)

```bash
npm run parser:setup   # from root: create .venv + pip install
npm run parser:dev     # from root: uvicorn on :8000
```

### Everything at once (from root)

```bash
npm run dev            # app + backend + parser concurrently
```

## License

Source-available under the [PolyForm Strict License 1.0.0](./LICENSE). You may **view**
the source code, but you may **not** use, copy, modify, distribute, or sell it.
All rights reserved.

Use of the application is subject to the [Terms & Conditions](./TERMS.md).
