# VentaDibus — Copilot Instructions

Pet drawing sales platform: React + TypeScript frontend, FastAPI + SQLite backend, Google OAuth authentication.

## Architecture

**Monorepo layout:** `frontend/` (React/Vite/TS) + `backend/` (FastAPI/SQLAlchemy/SQLite).

**Backend layers** (strictly layered — don't skip):
1. `routes/` → endpoint declaration, dependency injection, admin guard
2. `services/` → business logic (`AuthService`, `TokenService`, `GoogleOAuthService`)
3. `repositories/` → all DB access (Repository pattern, one class per model)
4. `models/` → SQLAlchemy ORM models
5. `schemas/` → Pydantic request/response models

**Frontend layers:**
- `pages/` → full-page route components (one per route)
- `components/` → reusable UI with co-located `.css` file
- `context/AuthContext.tsx` → global auth state (user, token, isLoading)
- `services/` → API calls only; `api.ts` exports `apiFetch` (public) and `authenticatedFetch` (Bearer token); `index.ts` re-exports all services

## Build & Run

```bash
# Backend (port 8000)
cd backend
pip install -r requirements.txt
python main.py
# Dev with reload: uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (port 5173)
cd frontend
npm install
npm run dev

# Lint frontend
cd frontend && npm run lint
```

Requires a `backend/.env` file with `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `SECRET_KEY`.

## Conventions

**Admin guard** — admin is identified by a hardcoded email constant `ADMIN_EMAIL`. Each mutable route file defines `verify_admin(user)` and calls it before any write operation. Do not change this to role-based unless explicitly asked.

**Routing** — all API routes are prefixed `/api/*`. Static uploaded images are served at `/uploads/drawings/`.

**Auth flow:**
1. Frontend sends Google JWT → `POST /api/auth/google`
2. Backend verifies via `google-auth`, upserts user, issues its own HS256 JWT (30 min)
3. Frontend stores token in `localStorage`, reads `exp` to detect expiry, sends `Authorization: Bearer <token>` on subsequent calls

**Database** — SQLite file `backend/ventadibus.db`. Tables: `users`, `drawings`, `pricing`, `testimonials`. Models use `SQLAlchemy 2.x` declarative style with `Base` from `app/config/database.py`.

**File uploads** — drawings POSTed as `multipart/form-data` and stored under `backend/uploads/drawings/`. URL stored in DB as `/uploads/drawings/<filename>`.

**Environment variables** — backend config via `pydantic-settings` (`app/config/settings.py`). Frontend uses Vite's `VITE_API_BASE_URL` prefix for env vars.

**Component style** — each component/page has a co-located `.css` file. No CSS-in-JS or Tailwind.

**TypeScript** — strict mode on. Services return typed interfaces matching backend Pydantic schemas. No `any` unless unavoidable.

## Key Files

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI app init, CORS, router registration, static mount |
| `backend/app/config/settings.py` | All env vars (Pydantic settings) |
| `backend/app/services/token_service.py` | JWT creation/verification |
| `frontend/src/context/AuthContext.tsx` | Auth state, login/logout, token persistence |
| `frontend/src/services/api.ts` | Base fetch utilities, `VITE_API_BASE_URL` |
| `frontend/src/App.tsx` | React Router setup, all routes |
