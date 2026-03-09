"use client";

import type { ReactNode } from "react";
import {useSyncExternalStore } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { LoadingScreen } from "@/features/ui";

let hasHydrated = false;
function subscribeHydration(onStoreChange: () => void) {
  if (!hasHydrated) {
    hasHydrated = true;
    onStoreChange();
  }
  return () => {};
}
function getHydrationSnapshot() {
  return hasHydrated;
}
function getHydrationServerSnapshot() {
  return false;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrationSnapshot,
    getHydrationServerSnapshot,
  );

  if (!hydrated || status !== "authenticated") {
    return <LoadingScreen title="Checking Save File" />;
  }

  return children;
}
