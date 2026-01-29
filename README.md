# Pixel English Quest

A production-ready, pixel-game styled English learning web app built with Next.js App Router and Strapi.

## Requirements

- Node.js 20+
- pnpm (recommended) or npm
- Strapi v5 backend running locally

## Environment Variables

Create `.env.local` in the frontend project root:

```bash
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

## Run Frontend

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Backend Configuration (Strapi)

Backend base URL is configured by `NEXT_PUBLIC_STRAPI_URL` and defaults to `http://localhost:1337`.

Expected endpoints:

- Auth
  - `POST /api/auth/local` `{ identifier, password }` → `{ jwt, user }`
  - `POST /api/auth/local/register` `{ username, email, password }` → `{ jwt, user }`
  - `GET /api/users/me` (Authorization required)
- Lessons
  - `GET /api/lessons?populate=questionBank&pagination[page]=1&pagination[pageSize]=20&filters[questionBank][active]=true`
  - `GET /api/lessons/:id/start` (preview only)
  - `POST /api/lessons/:id/start` (Authorization required; creates attempt and returns question snapshot)
  - `POST /api/lessons/:id/submit` (Authorization required; submits answers)
- Results
  - `GET /api/lesson-attempts/:id/result?includeExplanation=true` (Authorization required)

Auth notes:
- JWT is stored in `localStorage`.
- Any 401 response triggers auto-logout and redirects to `/login`.

## Learning Flow

1. Main Menu (`/`)
2. Level Select (`/lessons`)
3. Lesson Preview (`/lessons/[id]/start`) — no attempt is created here
4. Start Attempt (`/lessons/[id]/attempt`) — calls `POST /api/lessons/:id/start`
5. Submit Attempt (`/lessons/[id]/submit`) — calls `POST /api/lessons/:id/submit`
6. Result Screen (`/attempts/[id]/result`) — calls `GET /api/lesson-attempts/:id/result`

## Answer Contract (Strict)

The submit payload must follow these rules:

- multiple_choice / single_choice: `{ "answerId": "A" }`
- fill_blank / short_answer / listening: `{ "answer": "text..." }`
- true_false: `true | false`

One `questionId` must map to exactly one response. Never send raw strings.

## Project Structure (Feature-Based)

- `features/api` — Strapi fetch helpers (`fetchJson`, `fetchWithAuth`) and error normalization
- `features/auth` — client-side JWT auth utilities, provider, and route gating
- `features/lesson` — lesson APIs and `QuestionRenderer`
- `features/attempt` — attempt APIs and submit payload builder
- `features/profile` — profile API
- `features/ui` — reusable pixel UI components

## Extension Ideas

- Resume attempt (persist in-progress runs)
- XP / Level system and unlockable stages
- Leaderboard and seasonal events
- Achievements and collectibles
- PWA offline mode for practice drills
