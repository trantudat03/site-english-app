import type { AuthSession } from "@/features/auth/types";
import { fetchJson } from "@/features/api";
import { fetchWithAuth } from "@/features/api/strapiFetch";

export async function login(params: {
  identifier: string;
  password: string;
}): Promise<AuthSession> {
  return fetchJson<AuthSession>("/api/auth/local", {
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
  return fetchJson<AuthSession>("/api/auth/local/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function changePassword(params: {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}): Promise<AuthSession> {
  return fetchWithAuth<AuthSession>("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}
