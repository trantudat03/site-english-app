"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthSession, AuthUser } from "@/features/auth/types";
import { login as loginRequest, register as registerRequest } from "@/features/auth/authApi";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, clearSession, getStoredUser, getToken, setSession } from "@/features/auth/storage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  jwt: string | null;
  user: AuthUser | null;
  login: (params: { identifier: string; password: string }) => Promise<AuthSession>;
  register: (params: { username: string; email: string; password: string }) => Promise<AuthSession>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [jwt, setJwt] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [status, setStatus] = useState<AuthStatus>(() =>
    getToken() ? "authenticated" : "unauthenticated",
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== AUTH_TOKEN_KEY && e.key !== AUTH_USER_KEY) return;
      const updatedJwt = getToken();
      const updatedUser = getStoredUser();
      setJwt(updatedJwt);
      setUser(updatedUser);
      setStatus(updatedJwt ? "authenticated" : "unauthenticated");
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      jwt,
      user,
      login: async (params) => {
        const session = await loginRequest(params);
        setSession(session);
        setJwt(session.jwt);
        setUser(session.user);
        setStatus("authenticated");
        return session;
      },
      register: async (params) => {
        const session = await registerRequest(params);
        setSession(session);
        setJwt(session.jwt);
        setUser(session.user);
        setStatus("authenticated");
        return session;
      },
      logout: () => {
        clearSession();
        setJwt(null);
        setUser(null);
        setStatus("unauthenticated");
        router.replace("/login");
      },
    }),
    [jwt, router, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider.");
  return ctx;
}
