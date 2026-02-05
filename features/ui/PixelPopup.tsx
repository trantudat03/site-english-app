"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/features/ui/cn";

export type PixelPopupProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  classNames?: {
    overlay?: string;
    panel?: string;
    header?: string;
    body?: string;
    footer?: string;
  };
};

export function PixelPopup({
  header,
  footer,
  children,
  onClose,
  classNames,
}: PixelPopupProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    if (closing) return;      
    setClosing(true);
    setTimeout(() => onClose?.(), 200);
  };

  const content = (
    <div
      onClick={handleClose}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black/60 backdrop-blur-sm transition-opacity duration-200",
        closing && "opacity-0",
        classNames?.overlay
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "pixel-panel",
          "flex flex-col max-h-[75vh] w-full max-w-3xl",
          "overflow-hidden shadow-2xl",
          "transition-all duration-200 ease-out",
          closing && "scale-95 opacity-0",
          classNames?.panel
        )}
      >
        {/* HEADER */}
        {header && (
          <div className={cn("shrink-0 border-b-4 border-[color:var(--pixel-border)] p-4", classNames?.header)}>
            {header}
          </div>
        )}

        {/* BODY */}
        <div className={cn("flex-1 overflow-y-auto p-4", classNames?.body)}>
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className={cn("shrink-0 border-t-4 border-[color:var(--pixel-border)] p-4 flex justify-end", classNames?.footer)}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  const container = document.getElementById("pixel-root") || document.body;
  return createPortal(content, container);
}
