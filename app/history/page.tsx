"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { HttpError } from "@/features/api";
import { listAttemptHistory } from "@/features/attempt";
import { RequireAuth } from "@/features/auth";
import { ErrorScreen, GameLayout, LoadingScreen, PixelButton, PixelCard } from "@/features/ui";

export default function HistoryPage() {
  const [history, setHistory] = useState<unknown | null>(null);
  const [error, setError] = useState<{ message: string; friendly?: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await listAttemptHistory();
        if (!active) return;
        setHistory(res);
      } catch (e) {
        if (!active) return;
        if (e instanceof HttpError && (e.status === 404 || e.status === 403)) {
          setError({ message: "Attempt history is not enabled on the backend yet.", friendly: true });
          return;
        }
        setError({ message: e instanceof Error ? e.message : "Failed to load history." });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (error && !error.friendly) {
    return (
      <RequireAuth>
        <ErrorScreen title="History Failed" message={error.message} backHref="/" onRetry={() => location.reload()} />
      </RequireAuth>
    );
  }

  if (!history && !error) {
    return (
      <RequireAuth>
        <LoadingScreen title="Loading History" subtitle="Rewinding time..." />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <GameLayout title="History" subtitle="Your previous runs." backHref="/">
        {error?.friendly ? (
          <PixelCard title="Locked Feature" subtitle={error.message}>
            <div className="mt-2 text-2xl leading-7 text-[color:var(--game-muted)]">
              Add a Strapi endpoint for listing lesson attempts to enable this screen.
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/lessons" className="inline-flex">
                <PixelButton size="lg" variant="primary">
                  Play
                </PixelButton>
              </Link>
              <Link href="/profile" className="inline-flex">
                <PixelButton size="lg" variant="secondary">
                  Profile
                </PixelButton>
              </Link>
            </div>
          </PixelCard>
        ) : (
          <PixelCard title="Runs" subtitle="Backend response snapshot">
            <pre className="pixel-frame overflow-auto bg-[color:var(--pixel-panel-2)] p-3 text-base text-[color:var(--game-fg)]">
              {JSON.stringify(history, null, 2)}
            </pre>
          </PixelCard>
        )}
      </GameLayout>
    </RequireAuth>
  );
}
