import { PixelCard, cn } from "@/features/ui";

function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("h-4 w-full rounded bg-[color:var(--pixel-panel-2)]", className)} />;
}

export function HistoryListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <PixelCard key={idx} className="animate-pulse">
          <div className="flex flex-col gap-3">
            <SkeletonLine className="h-5 w-3/4" />
            <SkeletonLine className="w-2/3" />
            <div className="mt-2 flex flex-wrap gap-2">
              <SkeletonLine className="h-7 w-32" />
              <SkeletonLine className="h-7 w-28" />
              <SkeletonLine className="h-7 w-40" />
            </div>
          </div>
        </PixelCard>
      ))}
    </div>
  );
}

