# AI Agent Instructions for CPT Frontend

## Purpose
This repository is a React + TypeScript frontend bootstrapped with Create React App. It uses Redux Toolkit, redux-saga, axios, and client-side authentication state persisted with redux-persist.

## How to run
- `npm start` — start the app in development mode
- `npm run build` — build a production bundle into `build/`
- `npm test` — run tests via `npm --prefix ./test-runner test`
- `npm run test:watch` — run Jest in watch mode with config in `test-runner/jest.config.cjs`

## Key architecture
- `src/` is the application source folder
- `src/app/modules/` contains major feature modules (login, payment-management, loan-management, user-management, reports, master-record, profile, etc.)
- `src/app/setup/` contains app bootstrap logic:
  - `redux/` for store, reducer, saga, and persisted auth state
  - `routing/` for public/private route guards and app routes
  - `auth/AuthInit.tsx` for auth initialization
- `src/app/core/` contains reusable services and middleware:
  - `services/api.service.ts` configures axios with `REACT_APP_BASE_API_URL`
  - `middleware/tokenMiddleware.ts` validates JWT expiration and redirects to `/login` on expiration

## State and auth conventions
- Redux is configured in `src/app/setup/redux/Store.ts` with `redux-saga`, `redux-persist`, and `@manaflair/redux-batch`
- `auth` state is persisted using `redux-persist` and localStorage under key `auth`
- Route protection is implemented with `src/app/setup/routing/PrivateRoute.tsx` and `PublicRoute.tsx`
- API requests use a shared axios instance exported from `src/app/core/services/api.service.ts`

## Development conventions
- Feature modules use `components/`, `services/`, `redux/`, and `types/` subfolders when applicable
- `src/app/shared/components/` contains common UI elements
- Components and services typically import the shared `api` instance from `src/app/core/services/api.service.ts`

## Testing
- Jest config lives in `test-runner/jest.config.cjs`
- Root tests are not run with CRA’s default config; use the root scripts in `package.json`

## Notes for AI agents
- Prefer editing source under `src/` rather than `build/`
- Respect auth state persistence and token middleware when changing login/session behavior
- Keep CRA compatibility in mind when modifying config or scripts
- The README is generic Create React App documentation and does not describe project-specific architecture

## Useful files
- `package.json` — scripts, dependencies, devDependencies
- `src/app/setup/redux/Store.ts` — store and middleware configuration
- `src/app/setup/redux/RootReducer.ts` — root reducer and persisted auth config
- `src/app/core/services/api.service.ts` — axios setup and auth header injection
- `src/app/setup/routing/Routes.tsx` — route definitions and lazy-loaded pages
