import { fetchWithAuth } from "@/features/api";
import type { LessonId, LessonInfo, LessonSummary } from "@/features/lesson/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function toLessonSummary(entity: unknown): LessonSummary {
  const e = asRecord(entity) ?? {};
  const attributes = asRecord(e.attributes) ?? e;
  const id = String(e.id ?? e.documentId ?? "");

  return {
    id,
    title: String(attributes.title ?? attributes.name ?? `Lesson ${id}`),
    description:
      typeof attributes.description === "string" ? attributes.description : undefined,
    stage:
      typeof attributes.stage === "number"
        ? attributes.stage
        : typeof attributes.level === "number"
          ? attributes.level
          : undefined,
    questionCount:
      typeof attributes.questionCount === "number"
        ? attributes.questionCount
        : typeof attributes.question_bank_count === "number"
          ? attributes.question_bank_count
          : undefined,
  };
}

export async function listLessons(): Promise<LessonSummary[]> {
  const res = await fetchWithAuth<unknown>("/api/lessons?pagination[page]=1&pagination[pageSize]=20");

  const root = asRecord(res);
  const items = Array.isArray(root?.data) ? root?.data : Array.isArray(res) ? (res as unknown[]) : [];
  return items.map(toLessonSummary).filter((l) => Boolean(l.id));
}

export async function getLessonInfo(lessonId: LessonId): Promise<LessonInfo> {
  const res = await fetchWithAuth<unknown>(`/api/lessons/${lessonId}`);
  const root = asRecord(res) ?? {};
  const data = asRecord(root.data) ?? {};
  const entity = (root.data ?? res) as unknown;
  const e = asRecord(entity) ?? {};
  const attributes = asRecord(e.attributes) ?? asRecord(data.attributes) ?? e;

  const id = String(e.id ?? e.documentId ?? data.id ?? data.documentId ?? lessonId);
  const title = String(attributes.title ?? attributes.name ?? `Lesson ${id}`);
  const description = typeof attributes.description === "string" ? attributes.description : undefined;
  const questionCount =
    typeof attributes.questionCount === "number"
      ? attributes.questionCount
      : typeof attributes.question_bank_count === "number"
        ? attributes.question_bank_count
        : undefined;

  return { id, title, description, questionCount };
}
