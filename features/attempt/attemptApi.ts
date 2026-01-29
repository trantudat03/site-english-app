import { fetchWithAuth } from "@/features/api";
import type { AttemptAnswer, AttemptId } from "@/features/attempt/types";
import type { LessonId, LessonQuestion, QuestionType } from "@/features/lesson/types";

export type StartAttemptResponse = {
  attemptId: AttemptId;
  questions: LessonQuestion[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function normalizeQuestion(raw: unknown, index: number): LessonQuestion {
  const r = asRecord(raw) ?? {};
  const nested = asRecord(r.question) ?? {};

  const id = String(r.id ?? r.questionId ?? nested.id ?? index);
  const typeValue = String(r.type ?? r.questionType ?? nested.type ?? "short_answer");
  const type = typeValue as QuestionType;
  const prompt = String(
    r.content ??
      r.prompt ??
      r.question ??
      r.text ??
      nested.content ??
      nested.prompt ??
      nested.text ??
      "Question",
  );

  const rawOptions =
    r.options ?? r.choices ?? nested.options ?? nested.choices;
  const options = Array.isArray(rawOptions)
    ? rawOptions.map((opt, optIdx) => {
        const o = asRecord(opt) ?? {};
        return {
          id: String(
            o.id ??
              o.answerId ??
              o.key ??
              o.value ??
              String.fromCharCode(65 + optIdx),
          ),
          label: String(o.label ?? o.text ?? o.value ?? o.answer ?? `Option ${optIdx + 1}`),
        };
      })
    : undefined;

  return { id, type, prompt, options };
}

export async function startAttempt(lessonId: LessonId): Promise<StartAttemptResponse> {
  const res = await fetchWithAuth<unknown>(`/api/lessons/${lessonId}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const root = asRecord(res) ?? {};
  const data = asRecord(root.data) ?? {};
  const attempt = asRecord(root.attempt) ?? asRecord(data.attempt) ?? {};
  const attemptId = String(
    root.attemptId ?? attempt.id ?? root.id ?? data.attemptId ?? data.id ?? "",
  );
  const rawQuestions = Array.isArray(root.questions)
    ? root.questions
    : Array.isArray(data.questions)
      ? data.questions
      : [];

  const questions = rawQuestions.map(normalizeQuestion);

  return { attemptId, questions };
}

export async function submitAttempt(params: {
  lessonId: LessonId;
  attemptId: AttemptId;
  answers: AttemptAnswer[];
  includeDetails: boolean;
  includeExplanation: boolean;
  timeSpent?: number;
}) {
  return fetchWithAuth<unknown>(`/api/lessons/${params.lessonId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attemptId: params.attemptId,
      answers: params.answers,
      includeDetails: params.includeDetails,
      includeExplanation: params.includeExplanation,
      timeSpent: params.timeSpent,
    }),
  });
}

export async function getAttemptResult(attemptId: AttemptId) {
  return fetchWithAuth<unknown>(`/api/lesson-attempts/${attemptId}/result?includeExplanation=true`);
}

export async function listAttemptHistory() {
  return fetchWithAuth<unknown>("/api/lesson-attempts?sort=createdAt:desc&pagination[page]=1&pagination[pageSize]=20");
}
