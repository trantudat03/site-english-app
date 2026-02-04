"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { HistoryCard } from "@/components/history/HistoryCard";
import { HistoryListSkeleton } from "@/components/history/HistoryListSkeleton";
import { useDebouncedValue } from "@/components/history/useDebouncedValue";
import { PixelButton, PixelCard, cn } from "@/features/ui";
import { getLessonHistory } from "@/services/lesson";

function parseIntParam(value: string | null) {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export function HistoryListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const qFromUrl = searchParams.get("q") ?? "";
  const minScoreFromUrl = useMemo(() => parseIntParam(searchParams.get("minScore")), [searchParams]);
  const pageFromUrl = useMemo(() => Math.max(1, parseIntParam(searchParams.get("page")) ?? 1), [searchParams]);
  const pageSizeFromUrl = useMemo(() => Math.max(1, parseIntParam(searchParams.get("pageSize")) ?? 20), [searchParams]);

  const [qInput, setQInput] = useState(qFromUrl);
  const [minScoreInput, setMinScoreInput] = useState(minScoreFromUrl?.toString() ?? "");
  const qDebounced = useDebouncedValue(qInput, 400);

  const [items, setItems] = useState<Awaited<ReturnType<typeof getLessonHistory>>["data"]>([]);
  const [pagination, setPagination] = useState<Awaited<ReturnType<typeof getLessonHistory>>["meta"]["pagination"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => setQInput(qFromUrl), [qFromUrl]);
  useEffect(() => setMinScoreInput(minScoreFromUrl?.toString() ?? ""), [minScoreFromUrl]);

  const replaceQuery = useCallback((next: Record<string, string | null | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === undefined || value === "") sp.delete(key);
      else sp.set(key, value);
    }
    const qs = sp.toString();
    router.replace(qs ? `/history?${qs}` : "/history");
  }, [router, searchParams]);

  const handleClearFilters = useCallback(() => {
    setQInput("");
    setMinScoreInput("");
    replaceQuery({ q: null, minScore: null, lessonType: null, page: "1" });
  }, [replaceQuery]);

  useEffect(() => {
    const qTrimmed = qDebounced.trim();
    const qInputTrimmed = qInput.trim();
    if (qTrimmed !== qInputTrimmed) return;
    if (qTrimmed === qFromUrl) return;
    replaceQuery({ q: qTrimmed || null, page: "1" });
  }, [qDebounced, qFromUrl, qInput, replaceQuery]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await getLessonHistory({
          q: qFromUrl.trim() || undefined,
          minScore: minScoreFromUrl ?? undefined,
          page: pageFromUrl,
          pageSize: pageSizeFromUrl,
        });
        if (!active) return;
        setItems(res.data);
        setPagination(res.meta.pagination);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load history.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [minScoreFromUrl, pageFromUrl, pageSizeFromUrl, qFromUrl, refreshIndex, replaceQuery]);

  const hasAnyFiltersApplied = Boolean(qFromUrl.trim()) || typeof minScoreFromUrl === "number";
  const hasAnyFiltersDraft = Boolean(qInput.trim()) || Boolean(minScoreInput.trim()) || hasAnyFiltersApplied;
  const emptyMessage = hasAnyFiltersApplied ? "Không có kết quả phù hợp" : "Chưa có lịch sử làm bài";

  const canPrev = (pagination?.page ?? 1) > 1;
  const canNext = (pagination?.page ?? 1) < (pagination?.pageCount ?? 1);

  return (
    <div className="flex flex-col gap-6">
      <PixelCard title="Filters" subtitle="Search and refine your runs.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="pixel-text-title text-xs text-[color:var(--game-fg)]">Search</span>
              <input
                className="pixel-frame bg-[color:var(--pixel-panel-2)] px-3 py-3 text-2xl text-[color:var(--game-fg)] placeholder:text-[color:var(--game-muted)] focus:outline-none"
                placeholder="Search lesson title..."
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="pixel-text-title text-xs text-[color:var(--game-fg)]">Min score</span>
              <input
                className="pixel-frame bg-[color:var(--pixel-panel-2)] px-3 py-3 text-2xl text-[color:var(--game-fg)] placeholder:text-[color:var(--game-muted)] focus:outline-none"
                placeholder="e.g. 80"
                inputMode="numeric"
                value={minScoreInput}
                onChange={(e) => {
                  const next = e.target.value;
                  setMinScoreInput(next);
                  const parsed = parseIntParam(next);
                  replaceQuery({ minScore: parsed === null ? null : String(parsed), page: "1" });
                }}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xl text-[color:var(--game-muted)]">
              {pagination ? (
                <>
                  Total: {pagination.total} • Page {pagination.page} / {pagination.pageCount}
                </>
              ) : (
                "—"
              )}
            </div>
            <div className="flex gap-2">
              <PixelButton
                size="sm"
                variant="secondary"
                onClick={() => setRefreshIndex((v) => v + 1)}
                type="button"
                loading={loading}
              >
                Refresh
              </PixelButton>
              <PixelButton
                size="sm"
                variant="secondary"
                onClick={handleClearFilters}
                type="button"
                disabled={!hasAnyFiltersDraft}
              >
                Clear
              </PixelButton>
            </div>
          </div>
        </div>
      </PixelCard>

      {error ? (
        <PixelCard title="History Failed" subtitle={error}>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <PixelButton size="lg" variant="primary" onClick={() => setRefreshIndex((v) => v + 1)} type="button">
              Retry
            </PixelButton>
          </div>
        </PixelCard>
      ) : loading && items.length === 0 ? (
        <HistoryListSkeleton />
      ) : items.length === 0 ? (
        <PixelCard title="Lesson History" subtitle={emptyMessage}>
          <div className="mt-2 text-2xl leading-7 text-[color:var(--game-muted)]">
            {hasAnyFiltersApplied ? "Thử thay đổi bộ lọc hoặc xóa tìm kiếm." : "Hoàn thành một bài học để xem lịch sử tại đây."}
          </div>
        </PixelCard>
      ) : (
        <div className={cn("flex flex-col gap-4", loading && "opacity-70")}>
          {items.map((item) => (
            <HistoryCard key={item.attemptId} item={item} />
          ))}
        </div>
      )}

      {pagination && !error && pagination.pageCount > 1 && (
        <PixelCard title="Pagination">
          <div className="flex items-center justify-between gap-3">
            <PixelButton
              size="md"
              variant="secondary"
              type="button"
              disabled={!canPrev}
              onClick={() => replaceQuery({ page: String((pagination.page ?? 1) - 1) })}
            >
              Prev
            </PixelButton>
            <div className="text-xl text-[color:var(--game-muted)]">
              Page {pagination.page} / {pagination.pageCount}
            </div>
            <PixelButton
              size="md"
              variant="secondary"
              type="button"
              disabled={!canNext}
              onClick={() => replaceQuery({ page: String((pagination.page ?? 1) + 1) })}
            >
              Next
            </PixelButton>
          </div>
        </PixelCard>
      )}
    </div>
  );
}
