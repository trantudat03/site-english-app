## Current State (Repo Survey)

* App is essentially the Next.js starter: only [/app/page.tsx](file:///c:/project/web-mvp-english-app/english-app/app/page.tsx) plus [/app/layout.tsx](file:///c:/project/web-mvp-english-app/english-app/app/layout.tsx) and [/app/globals.css](file:///c:/project/web-mvp-english-mvp-english-app/english-app/app/globals.css).

* No routes beyond `/`, no feature folders, no Strapi integration, no auth utilities, no reusable UI components.

## Target Architecture (Feature-Based, Scalable)

* Create these top-level feature folders (importable via `@/…` per tsconfig):

  * `features/api` (Strapi base URL, fetch helpers, error normalization)

  * `features/auth` (token/user storage, login/register/logout, auth gate)

  * `features/lesson` (lesson APIs + types)

  * `features/attempt` (attempt APIs + result types)

  * `features/profile` (me endpoint + types)

  * `features/ui` (PixelButton/Card/Layout/Loading/Error + small primitives)

* Keep route files in `app/…` thin: pages call feature APIs + render feature/UI components. No endpoints hardcoded in components.

## Styling & “Pixel Game” Identity (Critical)

* Replace Geist with pixel fonts via `next/font/google` (e.g. Press Start 2P + VT323) and set global font variables.

* Rework `globals.css` into a game-like theme:

  * Pixel borders, shadow “depth”, dithered/pattern background, chunky spacing.

  * Button bounce/pixel-pop hover and subtle scene transitions.

  * Avoid SaaS layouts; use “main menu / level select / battle screen / result screen” framing.

* Add reusable pixel UI:

  * `<PixelButton />` (variants, disabled, loading)

  * `<PixelCard />` (stage/level card)

  * `<GameLayout />` (game HUD shell + optional back button)

  * `<LoadingScreen />` (full-screen scene)

  * `<ErrorScreen />` (friendly retry + home/login actions)

## API Layer (Fetch Only, Robust Errors)

* Add `NEXT_PUBLIC_STRAPI_URL` env support (default to `http://localhost:1337`).

* Implement `fetchJson` for public calls and `fetchWithAuth` for protected calls:

  * Attach `Authorization: Bearer <token>` from `localStorage`.

  * Normalize errors (400/403 friendly message; include status + details).

  * On `401`: clear auth, broadcast logout, client redirect to `/login`.

## Auth (Client-Side JWT Only)

* Implement `auth` utilities:

  * `login(identifier, password)` → POST `/api/auth/local`

  * `register(username, email, password)` → POST `/api/auth/local/register`

  * `logout()` (clear storage + redirect)

  * `getToken()` / `getUser()`

* Add an `AuthProvider` + `useAuth()` hook to keep UI consistent across tabs (storage event) and avoid blank screens during hydration.

* Add `RequireAuth` wrapper for protected pages (`/profile`, `/history`, gameplay/submit/result).

## Required Routes / Pages (App Router)

* `/` Main menu (pixel title, play/login/profile buttons)

* `/login` Login screen (pixel UI, error states)

* `/register` Register screen

* `/lessons` Level select:

  * GET `/api/lessons?populate=questionBank&pagination[page]=1&pagination[pageSize]=20&filters[questionBank][active]=true`

  * Render lessons as “stages” with difficulty badges.

* `/lessons/[id]/start` Lesson preview:

  * GET `/api/lessons/:id/start` (no attempt created)

  * CTA: “Start Run” (requires login) → navigates to attempt.

* `/lessons/[id]/attempt` Gameplay scene:

  * POST `/api/lessons/:id/start` (creates attempt + returns question snapshot)

  * Render questions via `<QuestionRenderer />`

  * Show progress (Q x / n), timer, disable submit if unanswered.

* `/lessons/[id]/submit` Submit logic scene:

  * POST `/api/lessons/:id/submit` with strict answer contract

  * Redirect to `/attempts/[attemptId]/result`

  * Implementation detail: persist answers in `sessionStorage` (avoid huge URLs), pass `attemptId` via search param.

* `/attempts/[id]/result` Result screen:

  * GET `/api/lesson-attempts/:id/result?includeExplanation=true`

  * Read-only, show score, pass/fail, per-question explanation if available.

* `/profile` Profile page:

  * GET `/api/users/me`

* `/history` Attempt history:

  * If backend exposes a list endpoint (commonly `/api/lesson-attempts?...`), integrate it.

  * If not available/403/404, show a friendly “history not enabled” screen without breaking the app.

## Question Handling Correctness (Strict Contract)

Define typed question models + `QuestionRenderer` mapping by `question.type`:

`multiple_choice` / `single_choice` → `{ answerId: "A" }`

* `fill_blank` / `short_answer` / `listening` → `{ answer: "text" }`
* `true_false` → `true | false`
* Enforce: 1 `questionId` = 1 response, never raw strings.
* Build a single `buildSubmitPayload()` that transforms UI state into the backend contract, with runtime guards for unknown types.

## Loading / Error Strategy (Never Blank)

* Add route-level `loading.tsx` and `error.tsx` where helpful.

* Within each page: explicit loading, empty, and error states using `<LoadingScreen />` and `<ErrorScreen />`.

## README (Production-Ready)

* Document:

  * Requirements + env vars

  * How to run frontend

  * Strapi base URL config

  * Learning flow explanation (preview → attempt → submit → result)

  * Extension ideas (resume attempt, XP/levels, leaderboard, achievements)

## Verification

* Run `npm run lint` + `npm run build`.

* Manual flow check against Strapi:

  * Register/login

  * Lesson list + preview

  * Start attempt, answer all types, submit, result

  * 401 handling → auto logout + redirect

If you confirm this plan, I’ll implement it end-to-end in the repo (routes, feature modules, pixel UI, Strapi integration, and README) and verify with build + basic flow checks.
