import type { AttemptAnswer, AttemptAnswerPayload } from "@/features/attempt/types";
import type { LessonQuestion } from "@/features/lesson/types";

function isChoicePayload(payload: AttemptAnswerPayload): payload is { answerId: string } {
  return typeof payload === "object" && payload !== null && "answerId" in payload;
}

function isTextPayload(payload: AttemptAnswerPayload): payload is { answer: string } {
  return typeof payload === "object" && payload !== null && "answer" in payload;
}

export function buildAttemptAnswers(params: {
  questions: LessonQuestion[];
  responses: Record<string, AttemptAnswerPayload | undefined>;
}): AttemptAnswer[] {
  return params.questions.map((q) => {
    const response = params.responses[q.id];
    if (response === undefined) {
      throw new Error(`Unanswered question: ${q.id}`);
    }

    if (q.type === "true_false") {
      if (typeof response !== "boolean") throw new Error(`Invalid true/false response for: ${q.id}`);
      return { questionId: q.id, response };
    }

    if (q.type === "multiple_choice" || q.type === "single_choice") {
      if (!isChoicePayload(response) || typeof response.answerId !== "string" || response.answerId.length === 0) {
        throw new Error(`Invalid choice response for: ${q.id}`);
      }
      return { questionId: q.id, response: { answerId: response.answerId } };
    }

    if (q.type === "fill_blank" || q.type === "short_answer" || q.type === "listening") {
      if (!isTextPayload(response) || typeof response.answer !== "string" || response.answer.trim().length === 0) {
        throw new Error(`Invalid text response for: ${q.id}`);
      }
      return { questionId: q.id, response: { answer: response.answer } };
    }

    throw new Error(`Unsupported question type: ${q.type}`);
  });
}

