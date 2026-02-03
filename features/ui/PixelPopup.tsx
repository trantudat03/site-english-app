"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/features/ui/cn";

export type Props = HTMLAttributes<HTMLDivElement> & {
  header?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

export function PixelPopup({
  header,
  footer,
  children,
  onClose,
  className,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "pixel-panel w-full max-w-4xl max-h-[85vh]",
          "flex flex-col overflow-hidden",
          className
        )}
      >
        {/* HEADER */}
        {header && (
          <div className="shrink-0 border-b-4 border-[color:var(--pixel-border)] p-5">
            {header}
          </div>
        )}

        {/* BODY */}
        <div className="flex flex-1 h-full min-h-0">
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="shrink-0 border-t-4 border-[color:var(--pixel-border)] p-4 flex justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
