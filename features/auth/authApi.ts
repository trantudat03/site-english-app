import type { AuthSession } from "@/features/auth/types";
import { fetchJson } from "@/features/api";

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

export async function forgotPassword(params:{
  email: string;
}): Promise<void> {
    return fetchJson<void>("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function resetPassword(params: {
  code: string;
  password: string;
  passwordConfirmation: string;
}): Promise<void> {
  return fetchJson<void>("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}