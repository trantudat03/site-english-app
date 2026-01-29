"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getAttemptResult } from "@/features/attempt";
import { RequireAuth } from "@/features/auth";
import { ErrorScreen, GameLayout, LoadingScreen, PixelButton, PixelCard } from "@/features/ui";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function getAttemptNode(res: unknown) {
  const root = asRecord(res) ?? {};
  const data = asRecord(root.data) ?? {};
  const result = asRecord(root.result) ?? {};
  const dataResult = asRecord(data.result) ?? {};
  return (
    asRecord(root.attempt) ??
    asRecord(data.attempt) ??
    asRecord(result.attempt) ??
    asRecord(dataResult.attempt) ??
    null
  );
}

function extractScore(res: unknown) {
  const root = asRecord(res) ?? {};
  const data = asRecord(root.data) ?? {};
  const result = asRecord(root.result) ?? {};
  const dataResult = asRecord(data.result) ?? {};
  const attempt = getAttemptNode(res) ?? {};
  const score =
    attempt.score ??
    root.score ??
    data.score ??
    result.score ??
    dataResult.score;
  return typeof score === "number" ? score : undefined;
}

function extractPassed(res: unknown) {
  const root = asRecord(res) ?? {};
  const data = asRecord(root.data) ?? {};
  const result = asRecord(root.result) ?? {};
  const dataResult = asRecord(data.result) ?? {};
  const attempt = getAttemptNode(res) ?? {};
  const passed =
    attempt.pass ??
    attempt.passed ??
    root.pass ??
    root.passed ??
    data.passed ??
    result.passed ??
    dataResult.passed;
  return typeof passed === "boolean" ? passed : undefined;
}

function extractStatus(res: unknown) {
  const root = asRecord(res) ?? {};
  const data = asRecord(root.data) ?? {};
  const attempt = getAttemptNode(res) ?? {};
  const value = attempt.status ?? root.status ?? data.status;
  return typeof value === "string" ? value : undefined;
}

function extractCorrectCount(res: unknown) {
  const root = asRecord(res) ?? {};
  const data = asRecord(root.data) ?? {};
  const result = asRecord(root.result) ?? {};
  const dataResult = asRecord(data.result) ?? {};
  const attempt = getAttemptNode(res) ?? {};
  const value =
    attempt.correctCount ??
    root.correctCount ??
    data.correctCount ??
    result.correctCount ??
    dataResult.correctCount;
  return typeof value === "number" ? value : undefined;
}

function extractGradableCount(res: unknown) {
  const root = asRecord(res) ?? {};
  const data = asRecord(root.data) ?? {};
  const result = asRecord(root.result) ?? {};
  const dataResult = asRecord(data.result) ?? {};
  const value =
    root.gradableCount ??
    data.gradableCount ??
    result.gradableCount ??
    dataResult.gradableCount;
  return typeof value === "number" ? value : undefined;
}

function extractTotalQuestions(res: unknown) {
  const root = asRecord(res) ?? {};
  const data = asRecord(root.data) ?? {};
  const result = asRecord(root.result) ?? {};
  const dataResult = asRecord(data.result) ?? {};
  const attempt = getAttemptNode(res) ?? {};
  const value =
    attempt.totalQuestions ??
    root.totalQuestions ??
    data.totalQuestions ??
    result.totalQuestions ??
    dataResult.totalQuestions;
  return typeof value === "number" ? value : undefined;
}

export default function AttemptResultPage() {
  const params = useParams<{ id: string }>();
  const attemptId = useMemo(() => String(params.id), [params.id]);
  const [result, setResult] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cached = sessionStorage.getItem(`peql_result_${attemptId}`);
        if (cached) {
          const parsed = JSON.parse(cached) as unknown;
          if (!active) return;
          setResult(parsed);
          sessionStorage.removeItem(`peql_result_${attemptId}`);
          return;
        }

        const res = await getAttemptResult(attemptId);
        if (!active) return;
        setResult(res);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load result.");
      }
    })();
    return () => {
      active = false;
    };
  }, [attemptId]);

  if (error) {
    return (
      <RequireAuth>
        <ErrorScreen title="Result Screen Failed" message={error} backHref="/lessons" onRetry={() => location.reload()} />
      </RequireAuth>
    );
  }

  if (!result) {
    return (
      <RequireAuth>
        <LoadingScreen title="Loading Result" subtitle="Rolling the credits..." />
      </RequireAuth>
    );
  }

  const score = extractScore(result);
  const passed = extractPassed(result);
  const status = extractStatus(result);
  const correctCount = extractCorrectCount(result);
  const gradableCount = extractGradableCount(result);
  const totalQuestions = extractTotalQuestions(result);
  const badge =
    passed === true ? (
      <span className="pixel-frame bg-[color:var(--game-accent-2)] px-2 py-1 text-xl text-[color:var(--pixel-border)]">
        WIN
      </span>
    ) : passed === false ? (
      <span className="pixel-frame bg-[color:var(--game-danger)] px-2 py-1 text-xl text-[color:var(--game-fg)]">
        LOSE
      </span>
    ) : (
      <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-xl text-[color:var(--game-muted)]">
        {status ? status.toUpperCase() : "DONE"}
      </span>
    );

  return (
    <RequireAuth>
      <GameLayout title="Result" subtitle={`Attempt ${attemptId}`} backHref="/lessons">
        <PixelCard title="Scoreboard" subtitle={score !== undefined ? `Score: ${score}` : "Score: ?"} right={badge}>
          <div className="mt-2 text-2xl leading-7 text-[color:var(--game-muted)]">
            {passed === true
              ? "Stage cleared. Your English is getting stronger."
              : passed === false
                ? "Stage failed. Train and try again."
                : "Run completed."}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {status && (
              <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-xl text-[color:var(--game-fg)]">
                Status: {status}
              </span>
            )}
            {correctCount !== undefined && (
              <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-xl text-[color:var(--game-fg)]">
                Correct: {correctCount}
              </span>
            )}
            {gradableCount !== undefined && (
              <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-xl text-[color:var(--game-fg)]">
                Gradable: {gradableCount}
              </span>
            )}
            {totalQuestions !== undefined && (
              <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-xl text-[color:var(--game-fg)]">
                Total: {totalQuestions}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/lessons" className="inline-flex">
              <PixelButton size="lg" variant="primary">
                Back to Levels
              </PixelButton>
            </Link>
            <Link href="/history" className="inline-flex">
              <PixelButton size="lg" variant="secondary">
                History
              </PixelButton>
            </Link>
          </div>
        </PixelCard>
      </GameLayout>
    </RequireAuth>
  );
}
