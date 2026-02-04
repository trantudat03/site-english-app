import Link from "next/link";

import { formatDateTime, formatDurationSeconds } from "@/components/format";
import { LessonTypeTag } from "@/components/result/LessonTypeTag";
import { PixelCard, cn } from "@/features/ui";
import type { LessonHistoryItem } from "@/services/lesson";

export function HistoryCard({ item }: { item: LessonHistoryItem }) {
  const timestamp = item.submittedAt ?? item.startedAt;
  const right = (
    <div className="flex flex-col items-end gap-2">
      <LessonTypeTag value={item.lesson.lessonType} />
      <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-lg leading-none text-[color:var(--game-fg)]">
        Score: {item.score ?? "—"}
      </span>
    </div>
  );

  return (
    <Link href={`/history/${encodeURIComponent(item.attemptId)}`} className="block focus:outline-none">
      <PixelCard
        className={cn(
          "cursor-pointer transition-colors",
          "hover:bg-[color:var(--pixel-panel-2)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--game-accent-2)]",
        )}
        title={item.lesson.title}
        subtitle={timestamp ? `Submitted: ${formatDateTime(timestamp)}` : "Submitted: —"}
        right={right}
      >
        <div className="mt-1 flex flex-wrap gap-2">
          <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-lg leading-none text-[color:var(--game-fg)]">
            Correct: {item.correctCount ?? "—"} / {item.totalQuestions ?? "—"}
          </span>
          <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-lg leading-none text-[color:var(--game-fg)]">
            Time: {formatDurationSeconds(item.timeSpent)}
          </span>
          <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-lg leading-none text-[color:var(--game-fg)]">
            Attempt ID: {item.attemptId}
          </span>
        </div>
      </PixelCard>
    </Link>
  );
}

