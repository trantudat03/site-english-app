import { NextRequest, NextResponse } from "next/server";
import { getStrapiBaseUrl } from "@/features/api/strapiFetch";

const REFRESH_COOKIE_NAME = "refreshToken";
const ACCESS_COOKIE_NAME = "accessToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
};
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60,
};

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
  const currentRefreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!currentRefreshToken) {
    return NextResponse.json({ message: "Missing refresh token" }, { status: 401 });
  }

  const strapiBase = stripTrailingSlash(getStrapiBaseUrl());
  const strapiRes = await fetch(`${strapiBase}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken: currentRefreshToken }),
  });

  const payload = (await readJsonSafely(strapiRes)) ?? (await strapiRes.text().catch(() => ""));

  if (!strapiRes.ok) {
    return NextResponse.json(payload || { message: "Refresh failed" }, { status: strapiRes.status });
  }

  const data = (payload ?? {}) as Record<string, unknown>;
  const accessToken =
    (typeof data.accessToken === "string" && data.accessToken) ||
    (typeof data.jwt === "string" && data.jwt) ||
    null;
  const nextRefreshToken = typeof data.refreshToken === "string" ? data.refreshToken : null;
  const user = (data.user ?? null) as unknown;

  if (!accessToken) {
    return NextResponse.json({ message: "Invalid refresh response" }, { status: 502 });
  }

  const res = NextResponse.json({ success: true, user }, { status: 200 });
  res.cookies.set(ACCESS_COOKIE_NAME, accessToken, ACCESS_COOKIE_OPTIONS);
  if (nextRefreshToken) {
    res.cookies.set(REFRESH_COOKIE_NAME, nextRefreshToken, COOKIE_OPTIONS);
  }
  return res;
}
