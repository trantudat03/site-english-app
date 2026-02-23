import type { AuthSession, AuthUser } from "@/features/auth/types";
import { fetchJson, fetchWithAuth } from "@/features/api";
import { tokenStore } from "@/features/auth/tokenStore";

export async function login(params: {
  identifier: string;
  password: string;
}): Promise<AuthSession> {
  const session = await fetchJson<AuthSession>("/api/auth/local", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  console.log("LOGIN SUCCESS. Session received:", session);
  if (session && session.jwt) {
    console.log("Setting token to store:", session.jwt.substring(0, 10) + "...");
    tokenStore.setToken(session.jwt);
  } else {
    console.error("LOGIN FAILED to extract JWT. Session structure:", session);
  }
  return session;
}

export async function register(params: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthSession> {
  const session = await fetchJson<AuthSession>("/api/auth/local/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  tokenStore.setToken(session.jwt);
  return session;
}

export async function changePassword(params: {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}): Promise<AuthSession> {
  // This is a protected route, so use fetchWithAuth
  const session = await fetchWithAuth<AuthSession>("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  tokenStore.setToken(session.jwt);
  return session;
}

export async function refreshToken(): Promise<AuthSession> {
  // 1. Get new access token using the HttpOnly cookie
  const { jwt } = await fetchJson<{ jwt: string }>("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  
  // 2. Set the token in memory so subsequent requests can use it
  tokenStore.setToken(jwt);

  // 3. Fetch the user profile
  const user = await fetchWithAuth<AuthUser>("/api/users/me");

  return { jwt, user };
}

export async function logout(): Promise<void> {
  try {
    await fetchJson("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } finally {
    tokenStore.setToken(null);
  }
}
