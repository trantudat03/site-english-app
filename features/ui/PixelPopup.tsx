"use client";

import { useState, type HTMLAttributes, type ReactNode } from "react";
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
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    if (closing) return;      
    setClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      onClick={handleClose}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "pt-6 sm:pt-10",
        "bg-black/60 transition-opacity duration-200",
        closing && "opacity-0"
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "pixel-panel w-full max-w-4xl",
          "h-[80vh] max-h-[600px]",
          "grid grid-rows-[auto_1fr_auto]",
          "overflow-hidden",
          "p-2 sm:p-4",
          "transition-all duration-200 ease-out",
          closing && "scale-95 opacity-0",
          className
        )}
      >
        {/* HEADER */}
        {header && (
          <div className="shrink-0 border-b-4 border-[color:var(--pixel-border)] py-3 px-4">
            {header}
          </div>
        )}

        {/* BODY */}
        <div className="h-full overflow-y-auto">
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="shrink-0 border-t-4 border-[color:var(--pixel-border)] py-2 px-4 flex justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
