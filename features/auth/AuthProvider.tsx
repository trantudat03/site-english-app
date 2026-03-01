"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthSession, AuthUser } from "@/features/auth/types";
import { changePassword as changePasswordRequest, login as loginRequest, logout as logoutRequest, refresh as refreshRequest, register as registerRequest } from "@/features/auth/authApi";
import { fetchWithAuth } from "@/features/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  login: (params: { identifier: string; password: string }) => Promise<AuthSession>;
  register: (params: { username: string; email: string; password: string }) => Promise<AuthSession>;
  changePassword: (params: {currentPassword: string; password: string; passwordConfirmation: string}) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshRequest();
        const currentUser = await fetchWithAuth<AuthUser>("/api/users/me");
        setUser(currentUser);
        setStatus("authenticated");
      } catch {
        setUser(null);
        setStatus("unauthenticated");
      }
    };
    initAuth();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login: async (params) => {
        const session = await loginRequest(params);
        const currentUser = await fetchWithAuth<AuthUser>("/api/users/me");
        setUser(currentUser);
        setStatus("authenticated");
        return session;
      },
      register: async (params) => {
        const session = await registerRequest(params);
        const currentUser = await fetchWithAuth<AuthUser>("/api/users/me");
        setUser(currentUser);
        setStatus("authenticated");
        return session;
      },
      changePassword: async (params) => {
         // This still uses the old API which will now go through Proxy
         return await changePasswordRequest(params);
      },
      logout: async () => {
        await logoutRequest();
        setUser(null);
        setStatus("unauthenticated");
        router.replace("/login");
      },
    }),
    [router, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider.");
  return ctx;
}
