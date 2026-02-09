"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { LessonSummary } from "@/features/lesson";
import { listLessons } from "@/features/lesson";
import { useAuth } from "@/features/auth";
import { ErrorScreen, GameLayout, LoadingScreen, PixelButton, PixelCard } from "@/features/ui";
import { LessonCard } from "@/components/lesson/LessonCard";

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
    <GameLayout
      title="Level Select"
      subtitle="Pick a stage to begin."
      backHref="/"
    >
      <div className="flex flex-col gap-4">
        {lessons.length === 0 ? (
          <PixelCard
            title="No Levels"
            subtitle="Ask the Game Master to add lessons in Strapi."
          >
            <Link href="/" className="inline-flex">
              <PixelButton size="lg" variant="secondary">
                Back to Menu
              </PixelButton>
            </Link>
          </PixelCard>
        ) : (
          lessons.map((lesson, idx) =>(
            <LessonCard key={lesson.id} lesson={lesson} index={idx} />
          ))
        )}

      </div>
    </GameLayout>
  );
}
