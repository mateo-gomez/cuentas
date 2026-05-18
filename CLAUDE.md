# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

Monorepo with two workspaces:
- `cuentas/` — React Native (Expo) mobile app
- `backend/` — Node.js/Express API with TypeScript

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

### From root
```bash
npm run app:dev         # expo start
npm run server:dev      # backend dev
```

## Environment

```bash
cp cuentas/.env.example cuentas/.env
cp backend/.env.example backend/.env
```

`EXPO_PUBLIC_API_URL` must be the local LAN IP — not `localhost` or `127.0.0.1` (device can't reach those).

## Backend Architecture

Follows **Clean Architecture** per feature:

```
src/features/{feature}/
  domain/          # entities, repository interfaces
  application/     # use cases, services, DTOs
  infrastructure/  # controllers, routes, DB models, repo impls
```

Features: `auth`, `transaction`, `category`.

**Dependency injection** is centralized in `src/infrastructure/container.ts` — all use cases and services are instantiated there and wired manually.

**Test strategy**: Unit tests in `backend/test/` mirror the `application/` layer. Repositories are injected so tests use in-memory fakes (e.g. `InMemoryTransaction.repository.ts`).

**Error handling**: Custom error classes in `application/errors/` and `infrastructure/api/errors/`. All async handlers wrapped with `catchAsync`. Central `errorHandler` middleware maps errors to HTTP responses.

**Transaction importer**: `TransactionImporter` use case + `ExcelTransactionParser` infrastructure service parses Excel uploads via `multer`, uses OpenAI (`categoryClassifier`) to classify transactions into categories.

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
- `/import` — Excel import screen
