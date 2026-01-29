import { GameLayout, PixelCard } from "@/features/ui";

export default function Loading() {
  return (
    <GameLayout title="Loading" subtitle="Warping to the next scene...">
      <PixelCard title="Please Wait">
        <div className="text-2xl leading-7 text-[color:var(--game-muted)]">
          Generating pixels…
        </div>
      </PixelCard>
    </GameLayout>
  );
}

