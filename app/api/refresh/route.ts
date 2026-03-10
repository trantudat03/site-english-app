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

async function doRefresh(refreshToken: string) {
  const strapiBase = stripTrailingSlash(getStrapiBaseUrl());
  const strapiRes = await fetch(`${strapiBase}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = (await readJsonSafely(strapiRes)) ?? (await strapiRes.text().catch(() => ""));

  if (!strapiRes.ok) {
    return { ok: false, status: strapiRes.status, payload };
  }

  const data = (payload ?? {}) as Record<string, unknown>;
  const accessToken =
    (typeof data.accessToken === "string" && data.accessToken) ||
    (typeof data.jwt === "string" && data.jwt) ||
    null;
  const nextRefreshToken = typeof data.refreshToken === "string" ? data.refreshToken : null;
  const user = (data.user ?? null) as unknown;

  if (!accessToken) {
    return { ok: false, status: 502, payload: { message: "Invalid refresh response" } };
  }

  return { ok: true, accessToken, nextRefreshToken, user };
}

export async function POST(req: NextRequest) {
  const currentRefreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!currentRefreshToken) {
    return NextResponse.json({ message: "Missing refresh token" }, { status: 401 });
  }

  const result = await doRefresh(currentRefreshToken);

  if (!result.ok) {
    return NextResponse.json(result.payload || { message: "Refresh failed" }, { status: result.status });
  }

  const res = NextResponse.json({ success: true, user: result.user }, { status: 200 });
  res.cookies.set(ACCESS_COOKIE_NAME, result.accessToken as string, ACCESS_COOKIE_OPTIONS);
  if (result.nextRefreshToken) {
    res.cookies.set(REFRESH_COOKIE_NAME, result.nextRefreshToken as string, REFRESH_COOKIE_OPTIONS);
  }
  return res;
}
