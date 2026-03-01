import type { AuthSession, RefreshResponse } from "@/features/auth/types";
import { fetchJson } from "@/features/api";
import { fetchWithAuth } from "@/features/api/strapiFetch";

export async function login(params: {
  identifier: string;
  password: string;
}): Promise<AuthSession> {
  return fetchJson<AuthSession>("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function register(params: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthSession> {
  return fetchJson<AuthSession>("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function refresh(): Promise<RefreshResponse> {
  return fetchJson<RefreshResponse>("/api/refresh", { method: "POST" });
}

export async function changePassword(params: {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}): Promise<void> {
  await fetchWithAuth<unknown>("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function logout(): Promise<void> {
  try {
    await fetchJson("/api/logout", { method: "POST" });
  } catch {
    // Ignore server logout error
  }
}
