"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthSession, AuthUser } from "@/features/auth/types";
import {
  login as loginRequest,
  register as registerRequest,
  changePassword as changePasswordRequest,
  logout as logoutRequest,
  refreshToken as refreshTokenRequest,
} from "@/features/auth/authApi";
import { tokenStore } from "@/features/auth/tokenStore";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  jwt: string | null;
  user: AuthUser | null;
  login: (params: { identifier: string; password: string }) => Promise<AuthSession>;
  register: (params: { username: string; email: string; password: string }) => Promise<AuthSession>;
  changePassword: (params: {
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
  }) => Promise<AuthSession>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [jwt, setJwt] = useState<string | null>(() => tokenStore.getToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const session = await refreshTokenRequest();
        console.log("Restored session:", session);
        if (mounted) {
          setJwt(session.jwt);
          setUser(session.user);
          setStatus("authenticated");
        }
      } catch (error) {
        if (mounted) {
          setJwt(null);
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      jwt,
      user,
      login: async (params) => {
        const session = await loginRequest(params);
        setJwt(session.jwt);
        setUser(session.user);
        setStatus("authenticated");
        return session;
      },
      register: async (params) => {
        const session = await registerRequest(params);
        setJwt(session.jwt);
        setUser(session.user);
        setStatus("authenticated");
        return session;
      },
      changePassword: async (params) => {
        const session = await changePasswordRequest(params);
        setJwt(session.jwt);
        setUser(session.user);
        setStatus("authenticated");
        return session;
      },
      logout: async () => {
        try {
          await logoutRequest();
        } catch (e) {
          console.error("Logout failed", e);
        }
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
