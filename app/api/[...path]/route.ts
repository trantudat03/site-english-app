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

async function refreshTokens(refreshToken: string) {
  const strapiBase = stripTrailingSlash(getStrapiBaseUrl());
  const refreshRes = await fetch(`${strapiBase}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshRes.ok) return null;

  const payload = (await readJsonSafely(refreshRes)) ?? null;
  if (!payload || typeof payload !== "object") return null;

  const data = payload as Record<string, unknown>;
  const accessToken =
    (typeof data.accessToken === "string" && data.accessToken) ||
    (typeof data.jwt === "string" && data.jwt) ||
    null;
  const nextRefreshToken = typeof data.refreshToken === "string" ? data.refreshToken : null;

  if (!accessToken) return null;

  return { accessToken, refreshToken: nextRefreshToken };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, params);
}

async function handleProxy(req: NextRequest, params: Promise<{ path: string[] }>) {
  const { path } = await params;
  const slug = path.join("/");

  const strapiBase = stripTrailingSlash(getStrapiBaseUrl());
  const url = `${strapiBase}/api/${slug}${req.nextUrl.search}`;

  const accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value ?? null;
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("cookie");
  headers.delete("authorization");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const body =
    req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;

  let res = await fetch(url, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  let rotatedAccessToken: string | null = null;
  let rotatedRefreshToken: string | null = null;

  if (res.status === 401) {
    const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
    if (refreshToken) {
      const rotated = await refreshTokens(refreshToken);
      if (rotated) {
        rotatedAccessToken = rotated.accessToken;
        rotatedRefreshToken = rotated.refreshToken ?? null;
        headers.set("Authorization", `Bearer ${rotated.accessToken}`);

        res = await fetch(url, {
          method: req.method,
          headers,
          body,
          redirect: "manual",
        });
      }
    }
  }

  const outgoingHeaders = new Headers(res.headers);
  outgoingHeaders.delete("set-cookie");

  const nextRes = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: outgoingHeaders,
  });

  if (rotatedAccessToken) {
    nextRes.cookies.set(ACCESS_COOKIE_NAME, rotatedAccessToken, ACCESS_COOKIE_OPTIONS);
  }
  if (rotatedRefreshToken) {
    nextRes.cookies.set(REFRESH_COOKIE_NAME, rotatedRefreshToken, COOKIE_OPTIONS);
  }

  if (res.status === 401) {
    nextRes.cookies.set(ACCESS_COOKIE_NAME, "", { ...ACCESS_COOKIE_OPTIONS, maxAge: 0 });
    nextRes.cookies.set(REFRESH_COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  }

  return nextRes;
}
