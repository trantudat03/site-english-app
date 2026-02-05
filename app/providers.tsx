"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { AuthProvider } from "@/features/auth";
import { GlobalModal, GlobalModalRef } from "@/features/ui/modal";

// Global ref to access the singleton modal from anywhere
export let globalModalRef: GlobalModalRef | null = null;

export function Providers({ children }: { children: ReactNode }) {
  const modalRef = useRef<GlobalModalRef>(null);

  useEffect(() => {
    if (modalRef.current) {
      globalModalRef = modalRef.current;
    }
  }, []);

  return (
    <AuthProvider>
      {children}
      <GlobalModal ref={modalRef} />
    </AuthProvider>
  );
}
