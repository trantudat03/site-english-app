"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { formatDateTime, formatDurationSeconds } from "@/components/format";
import { LessonTypeTag } from "@/components/result/LessonTypeTag";
import { QuestionResultCard } from "@/components/result/QuestionResultCard";
import { ScoreBadge } from "@/components/result/ScoreBadge";
import { HttpError } from "@/features/api";
import { PixelButton, PixelCard } from "@/features/ui";
import { getLessonAttemptResult } from "@/services/lesson";

export function AttemptResultClient() {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const attemptId = useMemo(() => String(params.attemptId), [params.attemptId]);
  const explainParam = searchParams.get("explain");
  const includeExplanation = explainParam === "1" || explainParam === "true";

  const [result, setResult] = useState<Awaited<ReturnType<typeof getLessonAttemptResult>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function replaceExplain(next: boolean) {
    const sp = new URLSearchParams(searchParams.toString());
    if (next) sp.set("explain", "1");
    else sp.delete("explain");
    const qs = sp.toString();
    router.replace(qs ? `/history/${encodeURIComponent(attemptId)}?${qs}` : `/history/${encodeURIComponent(attemptId)}`);
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await getLessonAttemptResult(attemptId, { includeExplanation });
        if (!active) return;
        setResult(res);
      } catch (e) {
        if (!active) return;
        if (e instanceof HttpError && e.status === 401) return;
        setError(e instanceof Error ? e.message : "Failed to load result.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [attemptId, includeExplanation]);

  if (error) {
    return (
      <PixelCard title="Result Failed" subtitle={error}>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <PixelButton size="lg" variant="primary" type="button" onClick={() => router.refresh()}>
            Retry
          </PixelButton>
        </div>
      </PixelCard>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col gap-4">
        <PixelCard className="animate-pulse">
          <div className="h-6 w-2/3 rounded bg-[color:var(--pixel-panel-2)]" />
          <div className="mt-3 h-4 w-1/2 rounded bg-[color:var(--pixel-panel-2)]" />
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="h-8 w-24 rounded bg-[color:var(--pixel-panel-2)]" />
            <div className="h-8 w-32 rounded bg-[color:var(--pixel-panel-2)]" />
            <div className="h-8 w-28 rounded bg-[color:var(--pixel-panel-2)]" />
          </div>
        </PixelCard>
        <PixelCard className="animate-pulse">
          <div className="h-5 w-1/2 rounded bg-[color:var(--pixel-panel-2)]" />
          <div className="mt-3 h-4 w-2/3 rounded bg-[color:var(--pixel-panel-2)]" />
          <div className="mt-3 h-4 w-2/3 rounded bg-[color:var(--pixel-panel-2)]" />
        </PixelCard>
      </div>
    );
  }

  const score = result.attempt.score;
  const passScore = result.lesson.passScore;
  const correctCount =
    result.attempt.correctCount ??
    result.answers.reduce((acc, a) => acc + (a.isCorrect === true ? 1 : 0), 0);
  const totalQuestions = result.attempt.totalQuestions ?? result.answers.length;

  return (
    <div className="flex flex-col gap-6">
      <PixelCard
        title={result.lesson.title}
        subtitle={result.lesson.description ?? undefined}
        right={<ScoreBadge score={score} passScore={passScore} />}
      >
        <div className="mt-2 flex flex-wrap gap-2">
          <LessonTypeTag value={result.lesson.lessonType} />
          <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-lg leading-none text-[color:var(--game-fg)]">
            Score: {score ?? "—"}
          </span>
          <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-lg leading-none text-[color:var(--game-fg)]">
            Correct: {correctCount} / {totalQuestions || "—"}
          </span>
          {typeof passScore === "number" && (
            <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-lg leading-none text-[color:var(--game-fg)]">
              Pass: {passScore}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="text-xl text-[color:var(--game-muted)]">
            Time spent: {formatDurationSeconds(result.attempt.timeSpent)}
          </div>
          <div className="text-xl text-[color:var(--game-muted)]">
            Started: {formatDateTime(result.attempt.startedAt)}
          </div>
          <div className="text-xl text-[color:var(--game-muted)]">
            Submitted: {formatDateTime(result.attempt.submittedAt)}
          </div>
          {result.questionBank.name && (
            <div className="text-xl text-[color:var(--game-muted)]">Question bank: {result.questionBank.name}</div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <PixelButton
            size="lg"
            variant={includeExplanation ? "primary" : "secondary"}
            type="button"
            onClick={() => replaceExplain(!includeExplanation)}
            disabled={loading}
          >
            {includeExplanation ? "Hide Explanation" : "Show Explanation"}
          </PixelButton>
        </div>
      </PixelCard>

      <div className="flex flex-col gap-4">
        {result.answers.map((answer, idx) => (
          <QuestionResultCard key={idx} index={idx} answer={answer} showExplanation={includeExplanation} />
        ))}
      </div>
    </div>
  );
}

