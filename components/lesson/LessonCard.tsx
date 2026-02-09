"use client";

import { LessonSummary } from "@/features/lesson";
import { PixelButton, PixelCard } from "@/features/ui";
import { getMediaUrl } from "@/features/utils/media";
import Link from "next/link";

type Props = {
    lesson: LessonSummary;
    index: number;
}

export function LessonCard({ lesson, index }: Props) {
    const bgImage = getMediaUrl(lesson.background ?? null)
    const mascotUrl = getMediaUrl(lesson.mascot ?? null)
    
    const bgStyle = bgImage
        ? {
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }
        : lesson.backgroundColor
            ? {
                backgroundColor: lesson.backgroundColor,
            }
            : {
                backgroundColor: "var(--game-bg)"
            }
    
    return (
        <PixelCard
            className="relative overflow-hidden"
            style={bgStyle}
            title={`Stage ${lesson.stage ?? index + 1}`}
            subtitle={lesson.title}
            right={
                <span className="pixel-frame bg-[color:var(--pixel-panel-2)] px-2 py-1 text-xl text-[color:var(--game-warning)]">
                    {lesson.questionCount ?? "?"} Q
                </span>
            }
        >
            {bgImage && <div className="absolute inset-0 z-0 bg-black/40" />}

            {mascotUrl && (
                <img
                    src={mascotUrl}
                    alt=""
                    className="
                    absolute bottom-2 right-2 z-20
                    h-24
                    pixelated
                    drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]
                "
                />
            )}
            {/* content */}
            <div className="relative z-10">
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
            </div>
        </PixelCard>
    )
}