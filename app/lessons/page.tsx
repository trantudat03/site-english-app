"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { LessonSummary } from "@/features/lesson";
import { listLessons } from "@/features/lesson";
import { useAuth } from "@/features/auth";
import { ErrorScreen, GameLayout, LoadingScreen, PixelButton, PixelCard } from "@/features/ui";

export default function LessonsPage() {
  const { status } = useAuth();
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    (async () => {
      try {
        const data = await listLessons();
        if (!active) return;
        setLessons(data);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load lessons.");
      }
    })();
    return () => {
      active = false;
    };
  }, [status]);

  if (error) {
    return <ErrorScreen title="Level Select Failed" message={error} backHref="/" onRetry={() => location.reload()} />;
  }

  if (status !== "authenticated") {
    return <LoadingScreen title="Checking Save File" subtitle="You must log in to play." />;
  }

  if (!lessons) {
    return <LoadingScreen title="Loading Levels" />;
  }

  return (
    <GameLayout title="Level Select" subtitle="Pick a stage to begin." backHref="/">
      <div className="flex flex-col gap-4">
        {lessons.length === 0 ? (
          <PixelCard title="No Levels" subtitle="Ask the Game Master to add lessons in Strapi.">
            <Link href="/" className="inline-flex">
              <PixelButton size="lg" variant="secondary">
                Back to Menu
              </PixelButton>
            </Link>
          </PixelCard>
        ) : (
          lessons.map((lesson, idx) => (
            <PixelCard
              key={lesson.id}
              title={`Stage ${lesson.stage ?? idx + 1}`}
              subtitle={lesson.title}
              right={
                <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-xl text-[color:var(--game-warning)]">
                  {lesson.questionCount ?? "?"} Q
                </span>
              }
            >
              {lesson.description && (
                <p className="mt-2 text-2xl leading-7 text-[color:var(--game-muted)]">
                  {lesson.description}
                </p>
              )}
              <div className="mt-4">
                <Link href={`/lessons/${lesson.id}/start`} className="inline-flex">
                  <PixelButton size="lg" variant="primary">
                    Enter
                  </PixelButton>
                </Link>
              </div>
            </PixelCard>
          ))
        )}
      </div>
    </GameLayout>
  );
}
