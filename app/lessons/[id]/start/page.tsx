"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { startAttempt } from "@/features/attempt";
import { RequireAuth } from "@/features/auth";
import { ErrorScreen, GameLayout, PixelButton, PixelCard } from "@/features/ui";

export default function LessonStartPage() {
  const params = useParams<{ id: string }>();
  const lessonId = useMemo(() => String(params.id), [params.id]);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const startedRef = useRef(false);

  if (error) {
    return (
      <RequireAuth>
        <ErrorScreen title="Stage Preview Failed" message={error} backHref="/lessons" onRetry={() => location.reload()} />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <GameLayout title="Stage Preview" subtitle={`Stage ${lessonId}`} backHref="/lessons">
        <PixelCard
          title="Briefing"
          subtitle="One run • No mercy"
          right={
            <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-xl text-[color:var(--game-accent-2)]">
              READY
            </span>
          }
        >
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PixelButton
              size="lg"
              variant="primary"
              loading={starting}
              disabled={starting}
              onClick={async () => {
                if (startedRef.current) return;
                startedRef.current = true;
                setStarting(true);
                try {
                  const res = await startAttempt(lessonId);
                  const key = `peql_attempt_${lessonId}_${res.attemptId}`;
                  const latestKey = `peql_attempt_${lessonId}_latest`;
                  sessionStorage.setItem(key, JSON.stringify(res));
                  sessionStorage.setItem(latestKey, JSON.stringify(res));
                  router.push(
                    `/lessons/${lessonId}/attempt?attemptId=${encodeURIComponent(res.attemptId)}`,
                  );
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to start run.");
                  setStarting(false);
                  startedRef.current = false;
                }
              }}
            >
              Start Run
            </PixelButton>
            <Link href="/lessons" className="inline-flex">
              <PixelButton size="lg" variant="secondary">
                Choose Another
              </PixelButton>
            </Link>
          </div>
        </PixelCard>
      </GameLayout>
    </RequireAuth>
  );
}
