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

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (refreshToken) {
    const strapiBase = stripTrailingSlash(getStrapiBaseUrl());
    await fetch(`${strapiBase}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }

  const res = NextResponse.json({ success: true }, { status: 200 });
  res.cookies.set(REFRESH_COOKIE_NAME, "", { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
  res.cookies.set(ACCESS_COOKIE_NAME, "", { ...ACCESS_COOKIE_OPTIONS, maxAge: 0 });
  return res;
}
