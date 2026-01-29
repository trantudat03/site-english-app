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
