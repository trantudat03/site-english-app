## Current Codebase Constraints
- Auth token lives in localStorage and the existing HTTP client [fetchWithAuth](file:///c:/project/web-mvp-english-app/english-app/features/api/strapiFetch.ts#L111-L158) is browser-only, so authenticated data fetching must happen in Client Components.
- Server Components are still useful for page shells/layout (no data fetch) and to compose client widgets.

## API Layer (Services)
- Add a new service module `services/lesson.ts`:
  - `getLessonHistory(params)` → GET `/api/me/lesson-history` with query params: `q`, `minScore`, `lessonType`, `page`, `pageSize`.
  - `getLessonAttemptResult(attemptId, { includeExplanation })` → GET `/api/lesson-attempts/:id/result` with optional `includeExplanation=true`.
- Add strict TypeScript interfaces for:
  - `LessonHistoryItem`, `LessonHistoryResponse` (including `meta.pagination.total/pageCount`).
  - `LessonAttemptResult` (attempt, lesson, questionBank, answers).
- Normalize/guard unknown payloads lightly (similar to existing defensive parsing) to keep UI stable if BE shape changes.

## /history (Lesson History List)
- Refactor [history/page.tsx](file:///c:/project/web-mvp-english-app/english-app/app/history/page.tsx) into:
  - `app/history/page.tsx` (Server Component): renders `<RequireAuth>` + `<GameLayout>` and mounts a client list component.
  - `components/history/HistoryListClient.tsx` (Client Component): owns filters, URL sync, fetching, pagination.
- Filters + URL sync:
  - Search box `q` with 300–500ms debounce (implement a small `useDebouncedValue` hook).
  - Min score number input `minScore`.
  - Lesson type tabs `lessonType` with validation:
    - Accept only known values (All + a small constant set), otherwise treat as null.
    - If API returns `400` for invalid `lessonType`, reset to null and refetch.
  - Pagination controls driven by `meta.pagination.total/pageCount`.
- Rendering:
  - Card-per-item via `components/history/HistoryCard.tsx`.
  - Entire card clickable (`Link` to `/history/{attemptId}`), showing:
    - `lesson.title`, `lesson.lessonType` (tag), `score`, `correctCount/totalQuestions`, submittedAt (fallback startedAt), `timeSpent` formatted `mm:ss`.
- Empty states:
  - If no results and (`q` or `minScore`) applied → “Không có kết quả phù hợp”.
  - If no results and no filters → “Chưa có lịch sử làm bài”.
- Loading/skeleton:
  - Add `components/history/HistoryListSkeleton.tsx` for initial and refetch states.

## /history/[attemptId] (Attempt Result Detail)
- Create `app/history/[attemptId]/page.tsx` (Server Component shell) + `components/result/AttemptResultClient.tsx` (Client fetch + render).
- UI Components:
  - `components/result/ScoreBadge.tsx` (pass/fail/score styling consistent with Pixel UI).
  - `components/result/LessonTypeTag.tsx` (shared with history cards).
  - `components/result/QuestionResultCard.tsx` (question content, user response, correct/incorrect highlight, per-question meta).
- Detail layout:
  - Header: lesson title + lesson type badge.
  - Score summary: score, correct/total, pass/fail.
  - Meta: time spent (mm:ss), started/submitted times, question bank name.
  - Question list: stacked on mobile, comfortable spacing; optional 2-col grid where it improves scanability.
- Explanation:
  - Read from query param (e.g. `?explain=1`) and only render when enabled.
  - When toggled, refetch with `includeExplanation=true` (avoid over-fetching by default).
- Error handling:
  - 401 handled by `fetchWithAuth` (clears session + redirect).
  - Other errors show existing `ErrorScreen` with retry.

## Routing / Compatibility
- Keep existing `/attempts/[id]/result` page intact.
- History cards navigate to the new canonical detail route `/history/[attemptId]`.

## Verification
- Add lightweight runtime checks for date/time formatting and mm:ss formatting.
- Run TypeScript check and Next build to ensure routes, imports, and types are correct.
- Manually validate:
  - Search debounce, filters, pagination correctness.
  - Empty state messages logic.
  - 400 lessonType reset behavior.
  - Detail page explanation toggle + correct/incorrect highlighting.