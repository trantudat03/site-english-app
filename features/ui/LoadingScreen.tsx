"use client";

import type { ReactNode } from "react";

import { GameLayout } from "@/features/ui/GameLayout";

export function LoadingScreen({
  title = "Loading",
  subtitle,
  children,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <GameLayout title={title} subtitle={subtitle}>
      <div className="pixel-panel p-6">
        <div className="text-2xl leading-7 text-[color:var(--game-fg)]">
          {children ?? "Generating the next scene..."}
        </div>
      </div>
    </GameLayout>
  );
}
