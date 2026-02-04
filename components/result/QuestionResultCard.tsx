import { formatDurationSeconds } from "@/components/format";
import { PixelCard, cn } from "@/features/ui";
import type { LessonAttemptAnswer } from "@/services/lesson";

function formatResponse(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function QuestionResultCard({
  index,
  answer,
  showExplanation,
}: {
  index: number;
  answer: LessonAttemptAnswer;
  showExplanation: boolean;
}) {
  const status =
    answer.isCorrect === true ? (
      <span className="pixel-frame bg-[color:var(--game-accent-2)] px-2 py-1 text-xl leading-none text-[color:var(--pixel-border)]">
        CORRECT
      </span>
    ) : answer.isCorrect === false ? (
      <span className="pixel-frame bg-[color:var(--game-danger)] px-2 py-1 text-xl leading-none text-[color:var(--game-fg)]">
        WRONG
      </span>
    ) : (
      <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-xl leading-none text-[color:var(--game-muted)]">
        DONE
      </span>
    );

  return (
    <PixelCard
      title={`Q${index + 1}`}
      subtitle={answer.question.type ? `Type: ${answer.question.type}` : undefined}
      right={status}
      className={cn(
        answer.isCorrect === true && "border border-[color:var(--game-accent-2)]",
        answer.isCorrect === false && "border border-[color:var(--game-danger)]",
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="text-2xl leading-7 text-[color:var(--game-fg)]">{answer.question.content}</div>

        <div className="flex flex-wrap gap-2">
          <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-lg leading-none text-[color:var(--game-fg)]">
            Earned: {answer.earnedScore ?? "—"}
          </span>
          <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-lg leading-none text-[color:var(--game-fg)]">
            Time: {formatDurationSeconds(answer.timeSpent)}
          </span>
        </div>

        <div>
          <div className="pixel-text-title text-xs text-[color:var(--game-fg)]">Your response</div>
          <div className="mt-2 pixel-frame bg-[color:var(--pixel-panel-2)] p-3 text-xl text-[color:var(--game-fg)]">
            {formatResponse(answer.response)}
          </div>
        </div>

        {showExplanation && answer.question.explanation && (
          <div>
            <div className="pixel-text-title text-xs text-[color:var(--game-fg)]">Explanation</div>
            <div className="mt-2 pixel-frame bg-[color:var(--pixel-panel-2)] p-3 text-xl text-[color:var(--game-muted)]">
              {answer.question.explanation}
            </div>
          </div>
        )}
      </div>
    </PixelCard>
  );
}

