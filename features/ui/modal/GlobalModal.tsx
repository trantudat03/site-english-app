"use client";

import { forwardRef, useImperativeHandle, useState, useRef, ReactNode } from "react";
import { PixelPopup } from "@/features/ui/PixelPopup";
import { GlobalModalProps, GlobalModalRef, ModalOpenProps } from "./types";

export const GlobalModal = forwardRef<GlobalModalRef, GlobalModalProps>(
  ({ children, description, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const resolveRef = useRef<(value: any) => void>(() => {});
    
    useImperativeHandle(ref, () => ({
      open: () => {
        return new Promise((resolve) => {
          resolveRef.current = resolve;
          setIsOpen(true);
        });
      },
      close: (result?: any) => {
        resolveRef.current(result);
        setIsOpen(false);
      },
    }));

    const handleClose = () => {
       resolveRef.current(undefined);
       setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
      <PixelPopup
        onClose={handleClose}
        {...props}
      >
        {description}
      </PixelPopup>
    );
  }
);

GlobalModal.displayName = "GlobalModal";
