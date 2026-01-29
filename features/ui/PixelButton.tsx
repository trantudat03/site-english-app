"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/features/ui/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

export type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function PixelButton({
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  children,
  ...rest
}: PixelButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      className={cn(
        "pixel-btn inline-flex items-center justify-center gap-2 rounded-none px-4 py-2",
        "select-none whitespace-nowrap leading-none",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--game-accent)]/40",
        isDisabled && "opacity-60 cursor-not-allowed",
        size === "sm" && "h-10 text-lg",
        size === "md" && "h-12 text-xl",
        size === "lg" && "h-14 text-2xl",
        variant === "primary" &&
          "bg-[color:var(--game-accent)] text-[color:var(--game-fg)]",
        variant === "secondary" &&
          "bg-[color:var(--pixel-panel)] text-[color:var(--game-fg)]",
        variant === "danger" &&
          "bg-[color:var(--game-danger)] text-[color:var(--game-fg)]",
        variant === "ghost" &&
          "bg-transparent text-[color:var(--game-fg)] border-[color:var(--game-fg)]",
        className,
      )}
      aria-busy={loading ? true : undefined}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? "..." : children}
    </button>
  );
}
