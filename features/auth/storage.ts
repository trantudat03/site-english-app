import type { AuthSession, AuthUser } from "@/features/auth/types";

export const AUTH_TOKEN_KEY = "peql_jwt";
export const AUTH_USER_KEY = "peql_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, session.jwt);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
