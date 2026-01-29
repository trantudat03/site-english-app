"use client";

import type { AttemptAnswerPayload } from "@/features/attempt/types";
import type { LessonQuestion } from "@/features/lesson/types";
import { PixelButton } from "@/features/ui/PixelButton";

function isChoiceType(type: LessonQuestion["type"]) {
  return type === "multiple_choice" || type === "single_choice";
}

function isTextType(type: LessonQuestion["type"]) {
  return type === "fill_blank" || type === "short_answer" || type === "listening";
}

export function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: LessonQuestion;
  value: AttemptAnswerPayload | undefined;
  onChange: (next: AttemptAnswerPayload) => void;
}) {
  if (question.type === "true_false") {
    const selected = typeof value === "boolean" ? value : null;
    return (
      <div className="mt-4 flex gap-3">
        <PixelButton
          size="lg"
          variant={selected === true ? "primary" : "secondary"}
          onClick={() => onChange(true)}
        >
          TRUE
        </PixelButton>
        <PixelButton
          size="lg"
          variant={selected === false ? "primary" : "secondary"}
          onClick={() => onChange(false)}
        >
          FALSE
        </PixelButton>
      </div>
    );
  }

  if (isChoiceType(question.type)) {
    const selectedId =
      value && typeof value === "object" && "answerId" in value
        ? (() => {
            const answerId = (value as Record<string, unknown>).answerId;
            return typeof answerId === "string" ? answerId : null;
          })()
        : null;

    return (
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(question.options ?? []).map((opt) => (
          <PixelButton
            key={opt.id}
            size="lg"
            variant={selectedId === opt.id ? "primary" : "secondary"}
            onClick={() => onChange({ answerId: opt.id })}
          >
            {opt.id}. {opt.label}
          </PixelButton>
        ))}
        {(question.options ?? []).length === 0 && (
          <div className="text-2xl text-[color:var(--game-muted)]">
            No options provided for this question.
          </div>
        )}
      </div>
    );
  }

  if (isTextType(question.type)) {
    const text =
      value && typeof value === "object" && "answer" in value
        ? (() => {
            const answer = (value as Record<string, unknown>).answer;
            return typeof answer === "string" ? answer : "";
          })()
        : "";
    return (
      <div className="mt-4">
        <input
          className="pixel-frame w-full bg-[color:var(--pixel-panel-2)] px-3 py-3 text-2xl text-[color:var(--game-fg)] placeholder:text-[color:var(--game-muted)] focus:outline-none"
          placeholder="Type your answer..."
          value={text}
          onChange={(e) => onChange({ answer: e.target.value })}
        />
      </div>
    );
  }

  return (
    <div className="mt-4 text-2xl leading-7 text-[color:var(--game-muted)]">
      Unsupported question type: {question.type}
    </div>
  );
}
