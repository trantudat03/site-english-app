"use client";

import type { ReactNode } from "react";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrationSnapshot,
    getHydrationServerSnapshot,
  );

  useEffect(() => {
    if (!hydrated) return;
    if (status !== "unauthenticated") return;
    const qs = searchParams.toString();
    const nextFull = pathname ? `${pathname}${qs ? `?${qs}` : ""}` : "";
    const nextPath = nextFull ? encodeURIComponent(nextFull) : "";
    router.replace(nextPath ? `/login?next=${nextPath}` : "/login");
  }, [hydrated, pathname, router, searchParams, status]);

  if (!hydrated || status === "loading" || status === "unauthenticated") {
    return <LoadingScreen title="Checking Save File" />;
  }

  return children;
}
