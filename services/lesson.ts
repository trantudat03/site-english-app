import { fetchWithAuth, HttpError } from "@/features/api";
import type { AttemptId } from "@/features/attempt/types";

export type PaginationMeta = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type LessonHistoryItem = {
  attemptId: AttemptId;
  lesson: {
    title: string;
    lessonType: string | null;
  };
  score: number | null;
  correctCount: number | null;
  totalQuestions: number | null;
  startedAt: string | null;
  submittedAt: string | null;
  timeSpent: number | null;
};

export type LessonHistoryResponse = {
  data: LessonHistoryItem[];
  meta: {
    pagination: PaginationMeta;
  };
};

export type LessonAttemptStatus = string;

export type LessonAttempt = {
  status: LessonAttemptStatus | null;
  startedAt: string | null;
  submittedAt: string | null;
  score: number | null;
  correctCount: number | null;
  totalQuestions: number | null;
  timeSpent: number | null;
};

export type LessonAttemptLesson = {
  title: string;
  description: string | null;
  lessonType: string | null;
  passScore: number | null;
  timeLimit: number | null;
};

export type LessonAttemptQuestion = {
  content: string;
  type: string | null;
  options?: unknown;
  explanation?: string | null;
};

export type LessonAttemptAnswer = {
  response: unknown;
  isCorrect: boolean | null;
  timeSpent: number | null;
  earnedScore: number | null;
  createdAt: string | null;
  question: LessonAttemptQuestion;
};

export type LessonAttemptQuestionBank = {
  name: string | null;
};

export type LessonAttemptResult = {
  attemptId: AttemptId;
  attempt: LessonAttempt;
  lesson: LessonAttemptLesson;
  questionBank: LessonAttemptQuestionBank;
  answers: LessonAttemptAnswer[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function toBooleanOrNull(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function pick<T>(...values: unknown[]): T | null {
  for (const v of values) {
    if (v !== undefined && v !== null) return v as T;
  }
  return null;
}

function normalizePagination(raw: unknown): PaginationMeta {
  const p = asRecord(raw) ?? {};
  const page = toNumber(p.page) ?? 1;
  const pageSize = toNumber(p.pageSize) ?? 10;
  const pageCount = toNumber(p.pageCount) ?? 1;
  const total = toNumber(p.total) ?? 0;
  return { page, pageSize, pageCount, total };
}

function normalizeLessonHistoryItem(raw: unknown, index: number): LessonHistoryItem {
  const r = asRecord(raw) ?? {};
  const lesson = asRecord(r.lesson) ?? asRecord(asRecord(r.attributes)?.lesson) ?? {};

  const attemptId = String(
    pick<string>(r.attemptId, r.attempt_id, r.id, asRecord(r.attempt)?.id) ?? index,
  ) as AttemptId;

  return {
    attemptId,
    lesson: {
      title: String(lesson.title ?? "Lesson"),
      lessonType: toStringOrNull(lesson.lessonType ?? lesson.type ?? r.lessonType),
    },
    score: toNumber(r.score),
    correctCount: toNumber(r.correctCount ?? r.correct_count),
    totalQuestions: toNumber(r.totalQuestions ?? r.total_questions),
    startedAt: toStringOrNull(r.startedAt ?? r.started_at),
    submittedAt: toStringOrNull(r.submittedAt ?? r.submitted_at),
    timeSpent: toNumber(r.timeSpent ?? r.time_spent),
  };
}

function normalizeLessonHistoryResponse(raw: unknown): LessonHistoryResponse {
  const root = asRecord(raw) ?? {};
  const dataNode = pick<unknown>(root.data, root.items, root.results) ?? [];
  const items = Array.isArray(dataNode) ? dataNode : [];

  const meta = asRecord(root.meta) ?? {};
  const pagination = normalizePagination(
    asRecord(meta.pagination) ?? asRecord(asRecord(root.pagination) ?? undefined),
  );

  return {
    data: items.map(normalizeLessonHistoryItem),
    meta: { pagination },
  };
}

export type GetLessonHistoryParams = {
  q?: string;
  minScore?: number;
  page?: number;
  pageSize?: number;
};

export async function getLessonHistory(params: GetLessonHistoryParams): Promise<LessonHistoryResponse> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (typeof params.minScore === "number" && Number.isFinite(params.minScore)) {
    search.set("minScore", String(params.minScore));
  }
  if (typeof params.page === "number" && Number.isFinite(params.page)) search.set("page", String(params.page));
  if (typeof params.pageSize === "number" && Number.isFinite(params.pageSize)) {
    search.set("pageSize", String(params.pageSize));
  }

  const path = `/api/me/lesson-history${search.size ? `?${search.toString()}` : ""}`;
  const res = await fetchWithAuth<unknown>(path);
  return normalizeLessonHistoryResponse(res);
}

function normalizeLessonAttemptResult(raw: unknown, attemptId: AttemptId): LessonAttemptResult {
  const root = asRecord(raw) ?? {};
  const data = asRecord(root.data) ?? {};
  const result = asRecord(root.result) ?? asRecord(data.result) ?? {};

  const attemptNode =
    asRecord(root.attempt) ??
    asRecord(data.attempt) ??
    asRecord(result.attempt) ??
    asRecord(asRecord(result.data)?.attempt) ??
    {};
  const lessonNode =
    asRecord(root.lesson) ??
    asRecord(data.lesson) ??
    asRecord(result.lesson) ??
    asRecord(attemptNode.lesson) ??
    {};
  const questionBankNode =
    asRecord(root.questionBank) ??
    asRecord(data.questionBank) ??
    asRecord(result.questionBank) ??
    asRecord(result.question_bank) ??
    {};

  const answersNode =
    pick<unknown>(root.answers, data.answers, result.answers, result.items, result.data) ?? [];
  const answersArray = Array.isArray(answersNode) ? answersNode : [];

  const answers: LessonAttemptAnswer[] = answersArray.map((ans) => {
    const a = asRecord(ans) ?? {};
    const questionNode = asRecord(a.question) ?? {};
    return {
      response: pick<unknown>(a.response, a.answer, a.userAnswer),
      isCorrect: toBooleanOrNull(a.isCorrect ?? a.correct),
      timeSpent: toNumber(a.timeSpent ?? a.time_spent),
      earnedScore: toNumber(a.earnedScore ?? a.earned_score),
      createdAt: toStringOrNull(a.createdAt ?? a.created_at),
      question: {
        content: String(pick<string>(questionNode.content, questionNode.prompt, questionNode.text) ?? "Question"),
        type: toStringOrNull(questionNode.type),
        options: questionNode.options ?? undefined,
        explanation: toStringOrNull(questionNode.explanation),
      },
    };
  });

  return {
    attemptId,
    attempt: {
      status: toStringOrNull(attemptNode.status),
      startedAt: toStringOrNull(attemptNode.startedAt ?? attemptNode.started_at),
      submittedAt: toStringOrNull(attemptNode.submittedAt ?? attemptNode.submitted_at),
      score: toNumber(attemptNode.score),
      correctCount: toNumber(attemptNode.correctCount ?? attemptNode.correct_count),
      totalQuestions: toNumber(attemptNode.totalQuestions ?? attemptNode.total_questions),
      timeSpent: toNumber(attemptNode.timeSpent ?? attemptNode.time_spent),
    },
    lesson: {
      title: String(pick<string>(lessonNode.title, lessonNode.name) ?? "Lesson"),
      description: toStringOrNull(lessonNode.description),
      lessonType: toStringOrNull(lessonNode.lessonType ?? lessonNode.type),
      passScore: toNumber(lessonNode.passScore ?? lessonNode.pass_score),
      timeLimit: toNumber(lessonNode.timeLimit ?? lessonNode.time_limit),
    },
    questionBank: {
      name: toStringOrNull(questionBankNode.name),
    },
    answers,
  };
}

export async function getLessonAttemptResult(
  attemptId: AttemptId,
  opts?: { includeExplanation?: boolean },
): Promise<LessonAttemptResult> {
  const includeExplanation = opts?.includeExplanation === true;
  const qs = includeExplanation ? "?includeExplanation=true" : "";
  try {
    const res = await fetchWithAuth<unknown>(`/api/lesson-attempts/${attemptId}/result${qs}`);
    return normalizeLessonAttemptResult(res, attemptId);
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw e;
  }
}
