# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

Monorepo with three workspaces:
- `cuentas/` — React Native (Expo) mobile app
- `backend/` — Node.js/Express API with TypeScript
- `pdf-parser/` — Python FastAPI + pdfplumber microservice for bank-statement PDFs

`docker-compose.yml` wires `backend` + `pdf-parser`; `render.yaml` deploys them.

## Commands

### App (`cuentas/`)
```bash
cd cuentas && npm install
npx expo start          # dev server
npm run lint            # eslint --fix
npm run format          # prettier --write
npm run ts              # typecheck
```

### Backend (`backend/`)
```bash
cd backend && npm install
npm run dev             # ts-node-dev with hot reload
npm test                # jest
npm run test:watch      # jest --watch
npx jest path/to/file   # single test file
```

### PDF parser (`pdf-parser/`)
```bash
npm run parser:setup    # from root: create .venv + pip install
npm run parser:dev      # from root: uvicorn on :8000
cd pdf-parser && pytest # run tests (testpaths=tests)
cd pdf-parser && pytest tests/test_x.py::test_name   # single test
```

### From root
```bash
npm run dev             # concurrently: app + backend + parser
npm run app:dev         # expo start
npm run server:dev      # backend dev
npm run build           # eas build (android production)
```

## Environment

```bash
cp cuentas/.env.example cuentas/.env
cp backend/.env.example backend/.env
```

`EXPO_PUBLIC_API_URL` must be the local LAN IP — not `localhost` or `127.0.0.1` (device can't reach those).

`PDF_PARSER_URL` (backend `.env`, server-side only — never exposed to the app) points Node at the Python parser. If the parser is down, `/transactions/import/pdf` returns a retryable 502/504; Excel import and manual entry are unaffected.

## Backend Architecture

Follows **Clean Architecture** per feature:

```
src/features/{feature}/
  domain/          # entities, repository interfaces
  application/     # use cases, services, DTOs
  infrastructure/  # controllers, routes, DB models, repo impls
```

Features: `auth`, `transaction`, `category`, `account`, `budget`, `importer`. Domain data is userId-scoped (`req.userId` from JWT); accounts and categories belong to a user, transactions carry `accountId`.

**Dependency injection** is centralized in `src/infrastructure/container.ts` — all use cases and services are instantiated there and wired manually.

**Test strategy**: Unit tests in `backend/test/` mirror the `application/` layer. Repositories are injected so tests use in-memory fakes (e.g. `InMemoryTransaction.repository.ts`).

**Error handling**: Custom error classes in `application/errors/` and `infrastructure/api/errors/`. All async handlers wrapped with `catchAsync`. Central `errorHandler` middleware maps errors to HTTP responses.

**Transaction importer** (`importer` feature): parses uploads via `multer`, then uses OpenAI (`categoryClassifier`) to classify transactions into categories. Two sources:
- **Excel** — parsed in-process (`ExcelTransactionParser`).
- **PDF** — forwarded as raw bytes to the `pdf-parser` microservice (Node never parses PDFs itself). Parser returns a typed JSON contract `{ bankId, transactions[], warnings[] }` or a structured 422. Bank identification and parsing are rule-based (no LLM). Calibrated: Bancolombia, Davibank, Rappi (see `pdf-parser/app/parsers/`). Real Bancolombia PDFs are encrypted — password support exists end-to-end.

## Frontend Architecture

React Native + Expo with `react-router-native` for navigation.

**Layer pattern**:
- `services/` — raw API calls via `helpers/client.ts` (axios wrapper)
- `hooks/` — data fetching and state (e.g. `useTransactions`, `useCategories`)
- `screens/` — pages composed from `Components/`

**Auth**: JWT stored in AsyncStorage. `AuthContext` provides auth state. `PrivateRoutes` wraps protected routes.

**Routes** (defined in `src/Routes.tsx`):
- `/login`, `/register` — public
- `/` — Home (transaction list)
- `/transactions/:type` and `/transactions/:type/:id` — create/edit transaction (nested: NumPad + Categories)
- `/categories/create`, `/categories/:id` — category management
- account management screens — CRUD + Home account filter
- `/import` — Excel/PDF import screen (bank picker + encrypted-PDF password input)
