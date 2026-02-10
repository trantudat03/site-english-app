"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import type { LessonQuestion } from "@/features/lesson";
import { QuestionRenderer } from "@/features/lesson";
import type { AttemptAnswerPayload } from "@/features/attempt";
import { RequireAuth } from "@/features/auth";
import { ErrorScreen, GameLayout, LoadingScreen, PixelButton, PixelCard } from "@/features/ui";

function isAnswered(question: LessonQuestion, response?: AttemptAnswerPayload) {
  if (response === undefined) return false;
  if (question.type === "true_false") return typeof response === "boolean";
  if (question.type === "multiple_choice" || question.type === "single_choice") {
    if (typeof response !== "object" || response === null) return false;
    const answerId = (response as Record<string, unknown>).answerId;
    return typeof answerId === "string" && answerId.length > 0;
  }
  return (
    typeof response === "object" &&
    response !== null &&
    "answer" in response &&
    typeof (response as Record<string, unknown>).answer === "string" &&
    ((response as Record<string, unknown>).answer as string).trim().length > 0
  );
}

export default function LessonAttemptPage() {
  const params = useParams<{ id: string }>();
  const lessonId = useMemo(() => String(params.id), [params.id]);
  const searchParams = useSearchParams();
  const attemptIdFromUrl = searchParams.get("attemptId");
  const router = useRouter();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<LessonQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswerPayload | undefined>>({});
  const [startedAt] = useState(() => Date.now());
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() =>{
    const timer = setInterval(() =>{
      setTimeSpent(Math.floor((Date.now() - startedAt) / 1000)); // Math.floor bỏ phần lẻ
    },1000);
    return () => clearInterval(timer)
  },[startedAt]) 

  function formatTime (seconds: number){
    const m = Math.floor(seconds/60); // tổng số giây/60 lấy phút
    const s = seconds % 60; 
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const key = attemptIdFromUrl ? `peql_attempt_${lessonId}_${attemptIdFromUrl}` : null;
        const raw = key ? sessionStorage.getItem(key) : null;
        const latestRaw = sessionStorage.getItem(`peql_attempt_${lessonId}_latest`);
        const source = raw ?? latestRaw;
        if (!source) {
          throw new Error("Missing attempt data. Please go back and press Start Run again.");
        }

        const parsed = JSON.parse(source) as { attemptId: string; questions: LessonQuestion[] };
        if (!parsed.attemptId || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
          throw new Error("Attempt response is empty. Please try Start Run again.");
        }
        if (!active) return;
        setAttemptId(parsed.attemptId);
        setQuestions(parsed.questions);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to start attempt.");
      }
    })();
    return () => {
      active = false;
    };
  }, [attemptIdFromUrl, lessonId]);

  if (error) {
    return <ErrorScreen title="Failed to Start Run" message={error} backHref={`/lessons/${lessonId}/start`} />;
  }

  if (!questions || !attemptId) {
    return (
      <RequireAuth>
        <LoadingScreen title="Starting Run" subtitle="Generating enemies (questions)..." />
      </RequireAuth>
    );
  }

  const current = questions[index];
  const currentResponse = answers[current.id];
  const answeredCount = questions.filter((q) => isAnswered(q, answers[q.id])).length;
  const allAnswered = answeredCount === questions.length;
  const unanswered = questions.map((q, i) => ({ q, i })).filter(({ q }) => !isAnswered(q, answers[q.id]));

  return (
    <RequireAuth>
      <GameLayout
        title={`Run • Stage ${lessonId}`}
        subtitle={`Question ${index + 1} / ${questions.length}`}
        backHref={`/lessons/${lessonId}/start`}
        actions={
          <div className="flex flex-col items-end gap-1">
            <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-lg text-[color:var(--game-accent-2)]">
              {answeredCount}/{questions.length}
            </span>
            <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-lg text-[color:var(--game-accent-2)]">
              {formatTime(timeSpent)}
            </span>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <PixelCard title="Enemy" subtitle={current.prompt}>
            <QuestionRenderer
              question={current}
              value={currentResponse}
              onChange={(next) => setAnswers((prev) => ({ ...prev, [current.id]: next }))}
            />
          </PixelCard>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <PixelButton
                size="lg"
                variant="secondary"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
              >
                Prev
              </PixelButton>
              <PixelButton
                size="lg"
                variant="secondary"
                onClick={() => {
                  if (index === questions.length - 1) {
                    const payload = {
                    lessonId,
                    attemptId,
                    questions,
                    answers,
                    startedAt,
                    timeSpent: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
                  };
                  sessionStorage.setItem(`peql_submit_${lessonId}_${attemptId}`, JSON.stringify(payload));
                  router.push(`/lessons/${lessonId}/submit?attemptId=${encodeURIComponent(attemptId)}`);
                  } else {
                    setIndex((i) => Math.min(questions.length - 1, i + 1))
                  }
                }}
                disabled={index === questions.length - 1 && !allAnswered}
              >
                {index === questions.length - 1 ? "Submit" : "Next"}
              </PixelButton>
            </div>
          </div>

          {!allAnswered && index === questions.length - 1 && (
            <PixelCard title="Gate Locked">
              <div className="text-2xl text-[color:var(--game-muted)]">
                Missing questions:
                <div className="mt-2 text-base text-[color:var(--game-muted)] flex gap-2">
                  {unanswered.map(({ q, i }) => (
                    <div key={q.id} className="flex items-center cursor-pointer" onClick={() =>setIndex(i)}>
                      <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-0.5 text-[color:var(--game-accent-2)]">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PixelCard>
          )}
        </div>
      </GameLayout>
    </RequireAuth>
  );
}
