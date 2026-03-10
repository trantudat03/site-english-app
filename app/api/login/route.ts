import { NextRequest, NextResponse } from "next/server";
import { getStrapiBaseUrl } from "@/features/api/strapiFetch";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
} from "@/lib/auth-constants";

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

async function readJsonSafely(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return undefined;
  try {
    return (await res.json()) as unknown;
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const identifier = typeof body?.identifier === "string" ? body.identifier : null;
  const password = typeof body?.password === "string" ? body.password : null;

  if (!identifier || !password) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const strapiBase = stripTrailingSlash(getStrapiBaseUrl());
  const strapiRes = await fetch(`${strapiBase}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  const payload = (await readJsonSafely(strapiRes)) ?? (await strapiRes.text().catch(() => ""));

  if (!strapiRes.ok) {
    return NextResponse.json(payload || { message: "Login failed" }, { status: strapiRes.status });
  }

  const data = (payload ?? {}) as Record<string, unknown>;
  const accessToken =
    (typeof data.accessToken === "string" && data.accessToken) ||
    (typeof data.jwt === "string" && data.jwt) ||
    null;
  const refreshToken = typeof data.refreshToken === "string" ? data.refreshToken : null;
  if (!accessToken) {
    return NextResponse.json({ message: "Invalid auth response" }, { status: 502 });
  }

  const res = NextResponse.json({ success: true }, { status: 200 });
  res.cookies.set(ACCESS_COOKIE_NAME, accessToken, ACCESS_COOKIE_OPTIONS);
  if (refreshToken) {
    res.cookies.set(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
  }
  return res;
}
