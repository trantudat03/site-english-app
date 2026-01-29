"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { buildAttemptAnswers, submitAttempt } from "@/features/attempt";
import { RequireAuth } from "@/features/auth";
import type { AttemptAnswerPayload } from "@/features/attempt/types";
import type { LessonQuestion } from "@/features/lesson";
import { ErrorScreen, LoadingScreen } from "@/features/ui";

type StoredPayload = {
  lessonId: string;
  attemptId: string;
  questions: LessonQuestion[];
  answers: Record<string, AttemptAnswerPayload | undefined>;
  timeSpent?: number;
};

export default function LessonSubmitPage() {
  const params = useParams<{ id: string }>();
  const lessonId = useMemo(() => String(params.id), [params.id]);
  const search = useSearchParams();
  const attemptId = search.get("attemptId");
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const storageKey = attemptId ? `peql_submit_${lessonId}_${attemptId}` : null;
  const raw = storageKey ? sessionStorage.getItem(storageKey) : null;
  const blockingError =
    !attemptId ? "Missing attemptId." : !raw ? "No saved answers found for this run." : null;

  useEffect(() => {
    if (!attemptId || !storageKey || !raw) return;
    if (submittedRef.current) return;

    const dedupeKey = `peql_submit_done_${lessonId}_${attemptId}`;
    if (sessionStorage.getItem(dedupeKey) === "1") return;
    sessionStorage.setItem(dedupeKey, "1");
    submittedRef.current = true;

    (async () => {
      try {
        const payload = JSON.parse(raw) as StoredPayload;
        const answers = buildAttemptAnswers({ questions: payload.questions, responses: payload.answers });
        const result = await submitAttempt({
          lessonId,
          attemptId: payload.attemptId,
          answers,
          includeDetails: true,
          includeExplanation: true,
          timeSpent: payload.timeSpent,
        });
        sessionStorage.removeItem(storageKey);
        sessionStorage.setItem(`peql_result_${payload.attemptId}`, JSON.stringify(result));
        router.replace(`/attempts/${encodeURIComponent(payload.attemptId)}/result`);
      } catch (e) {
        sessionStorage.removeItem(dedupeKey);
        submittedRef.current = false;
        setError(e instanceof Error ? e.message : "Submit failed.");
      }
    })();
  }, [attemptId, lessonId, raw, router, storageKey]);

  if (blockingError || error) {
    return (
      <RequireAuth>
        <ErrorScreen
          title="Submit Failed"
          message={blockingError ?? error ?? "Submit failed."}
          backHref={`/lessons/${lessonId}/attempt`}
          onRetry={() => location.reload()}
        />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <LoadingScreen title="Submitting Run" subtitle="Calculating score..." />
    </RequireAuth>
  );
}
