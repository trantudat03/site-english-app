import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/features/ui/cn";

export type PixelCardProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
};

export function PixelCard({
  className,
  title,
  subtitle,
  right,
  children,
  ...rest
}: PixelCardProps) {
  return (
    <div className={cn("pixel-panel p-4", className)} {...rest}>
      {(title || subtitle || right) && (
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <div className="pixel-text-title truncate text-sm text-[color:var(--game-fg)]">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="mt-1 text-lg leading-6 text-[color:var(--game-muted)]">
                {subtitle}
              </div>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
