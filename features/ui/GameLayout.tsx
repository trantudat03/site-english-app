import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/features/ui/cn";

export type GameLayoutProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  backHref?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function GameLayout({
  title,
  subtitle,
  backHref,
  actions,
  children,
  className,
}: GameLayoutProps) {
  return (
    <div id="pixel-root" className="pixel-bg min-h-screen relative">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        <header className="pixel-pop">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {backHref && (
                <Link
                  href={backHref}
                  className={cn(
                    "inline-block text-lg text-[color:var(--game-muted)] underline decoration-dotted",
                    "hover:text-[color:var(--game-fg)]",
                  )}
                >
                  ← Back
                </Link>
              )}
              {title && (
                <h1 className="pixel-text-title mt-3 text-base text-[color:var(--game-fg)]">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-2xl leading-7 text-[color:var(--game-muted)]">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </header>

        <main className={cn("pixel-pop", className)}>{children}</main>
      </div>
    </div>
  );
}
