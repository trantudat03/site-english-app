"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { GameLayout } from "@/features/ui/GameLayout";
import { PixelButton } from "@/features/ui/PixelButton";
import { cn } from "@/features/ui/cn";

export function ErrorScreen({
  title = "Something went wrong",
  message,
  backHref = "/",
  onRetry,
}: {
  title?: ReactNode;
  message?: ReactNode;
  backHref?: string;
  onRetry?: () => void;
}) {
  return (
    <GameLayout title={title}>
      <div className="pixel-panel p-6">
        {message && (
          <div className="text-2xl leading-7 text-[color:var(--game-muted)]">
            {message}
          </div>
        )}

        <div className={cn("mt-6 flex flex-col gap-3 sm:flex-row")}>
          {onRetry && (
            <PixelButton onClick={onRetry} variant="primary" size="lg">
              Retry
            </PixelButton>
          )}
          <Link href={backHref} className="inline-flex">
            <PixelButton variant="secondary" size="lg">
              Go Back
            </PixelButton>
          </Link>
          <Link href="/login" className="inline-flex">
            <PixelButton variant="ghost" size="lg">
              Login
            </PixelButton>
          </Link>
        </div>
      </div>
    </GameLayout>
  );
}
