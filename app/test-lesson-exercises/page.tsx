"use client";

import Link from "next/link";
import { GameLayout, PixelButton, PixelCard } from "@/features/ui";
import { RequireAuth } from "@/features/auth";


export default function LessonExercisesPage() {
  return (
    <RequireAuth>
      <GameLayout title="Lesson Exercises" backHref="/">
        <PixelCard title="Lesson Exercises"
          right={
            <PixelButton
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[var(--clay-dark)]">
                settings
              </span>
            </PixelButton>
          }
        >
          <div className="text-2xl leading-7 text-[color:var(--game-fg)]">
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <Link href="/test-lesson-exercises/matching">
                <PixelButton size="lg" variant="primary" className="w-full">
                    Nhấn vào các cặp tương đương
                </PixelButton>
            </Link>
            <Link href="/test-lesson-exercises/choose">
                <PixelButton size="lg" variant="primary" className="w-full">
                    Chọn bản dịch đúng
                </PixelButton>
            </Link>
            <Link href="/test-lesson-exercises/translate">
                <PixelButton size="lg" variant="primary" className="w-full">
                    Dịch câu này
                </PixelButton>
            </Link>
            <Link href="/test-lesson-exercises/fill">
                <PixelButton size="lg" variant="primary" className="w-full">
                    Hoàn tất bản dịch
                </PixelButton>
            </Link>
          </div>
        </PixelCard>
      </GameLayout>
    </RequireAuth>
  );
}
