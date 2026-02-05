"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/features/ui/cn";

type PixelTabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  icon?: string;
};

export function PixelTabButton({
  active = false,
  icon,
  className,
  children,
  ...props
}: PixelTabButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "pixel-frame w-full px-4 py-3",
        "flex items-center gap-3",
        "text-xs uppercase tracking-widest",
        "transition-colors",
        active
          ? "bg-[color:var(--game-accent)] text-black"
          : "bg-[color:var(--pixel-panel-2)] hover:bg-[color:var(--pixel-panel)]",
        className
      )}
    >
      {icon && (
        <span className="material-symbols-outlined text-base shrink-0">
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </button>
  );
}
