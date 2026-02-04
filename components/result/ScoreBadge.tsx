import { cn } from "@/features/ui";

export function ScoreBadge({
  score,
  passScore,
  className,
}: {
  score: number | null | undefined;
  passScore: number | null | undefined;
  className?: string;
}) {
  const hasScore = typeof score === "number";
  const hasPassScore = typeof passScore === "number";
  const passed = hasScore && hasPassScore ? score >= passScore : null;

  const label =
    passed === true ? "PASS" : passed === false ? "FAIL" : hasScore ? "DONE" : "—";

  const color =
    passed === true
      ? "bg-[color:var(--game-accent-2)] text-[color:var(--pixel-border)]"
      : passed === false
        ? "bg-[color:var(--game-danger)] text-[color:var(--game-fg)]"
        : "bg-[color:var(--pixel-panel-2)] text-[color:var(--game-muted)]";

  return (
    <span className={cn("pixel-frame inline-flex items-center px-2 py-1 text-xl leading-none", color, className)}>
      {label}
    </span>
  );
}

