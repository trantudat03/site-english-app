import { cn } from "@/features/ui";

const COLORS: Record<string, string> = {
  vocabulary: "bg-[color:var(--game-accent)] text-[color:var(--pixel-border)]",
  grammar: "bg-[color:var(--game-accent-2)] text-[color:var(--pixel-border)]",
  reading: "bg-[color:var(--pixel-panel-2)] text-[color:var(--game-fg)]",
  listening: "bg-[color:var(--pixel-panel-2)] text-[color:var(--game-fg)]",
  speaking: "bg-[color:var(--pixel-panel-2)] text-[color:var(--game-fg)]",
  writing: "bg-[color:var(--pixel-panel-2)] text-[color:var(--game-fg)]",
};

export function LessonTypeTag({ value, className }: { value: string | null | undefined; className?: string }) {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  return (
    <span
      className={cn(
        "pixel-frame inline-flex items-center px-2 py-1 text-lg leading-none",
        COLORS[key] ?? "bg-[color:var(--pixel-panel-2)] text-[color:var(--game-fg)]",
        className,
      )}
    >
      {value}
    </span>
  );
}

