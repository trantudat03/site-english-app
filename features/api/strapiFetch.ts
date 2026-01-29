import { ApiErrorPayload } from "@/features/api/strapiTypes";
import { AUTH_TOKEN_KEY, clearSession } from "@/features/auth/storage";

export const DEFAULT_STRAPI_URL = "http://localhost:1337";

export function getStrapiBaseUrl() {
  return process.env.NEXT_PUBLIC_STRAPI_URL?.trim() || DEFAULT_STRAPI_URL;
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const base = getStrapiBaseUrl().replace(/\/+$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

export class HttpError extends Error {
  status: number;
  url: string;
  payload?: ApiErrorPayload | unknown;

  constructor(message: string, opts: { status: number; url: string; payload?: unknown }) {
    super(message);
    this.name = "HttpError";
    this.status = opts.status;
    this.url = opts.url;
    this.payload = opts.payload;
  }
}

async function parseErrorPayload(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return (await res.json()) as unknown;
    } catch {
      return undefined;
    }
  }
  try {
    const text = await res.text();
    return text ? { message: text } : undefined;
  } catch {
    return undefined;
  }
}

function toFriendlyMessage(status: number) {
  if (status === 400) return "That request looks invalid. Please try again.";
  if (status === 403) return "You don’t have permission to do that.";
  if (status === 404) return "That content could not be found.";
  if (status === 500) return "Server error. Please try again in a moment.";
  return "Network error. Please try again.";
}

function normalizeErrorPayload(payload: unknown): ApiErrorPayload | undefined {
  if (!payload || typeof payload !== "object") return undefined;

  const root = payload as Record<string, unknown>;
  if (typeof root.message === "string") {
    return { message: root.message, details: root.details };
  }

  const nestedError = root.error;
  if (nestedError && typeof nestedError === "object") {
    const err = nestedError as Record<string, unknown>;
    if (typeof err.message === "string") {
      return { message: err.message, details: err.details };
    }
  }
  return undefined;
}

export async function fetchJson<T>(
  pathOrUrl: string,
  init?: RequestInit,
): Promise<T> {
  const url = toAbsoluteUrl(pathOrUrl);
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const raw = await parseErrorPayload(res);
    const normalized = normalizeErrorPayload(raw);
    throw new HttpError(normalized?.message || toFriendlyMessage(res.status), {
      status: res.status,
      url,
      payload: normalized || raw,
    });
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export function clearClientAuthStorage() {
  if (typeof window === "undefined") return;
  clearSession();
}

export async function fetchWithAuth<T>(
  pathOrUrl: string,
  init?: RequestInit,
): Promise<T> {
  if (typeof window === "undefined") {
    throw new HttpError("fetchWithAuth must run in the browser.", {
      status: 500,
      url: toAbsoluteUrl(pathOrUrl),
    });
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const url = toAbsoluteUrl(pathOrUrl);

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (res.status === 401) {
    clearClientAuthStorage();
    window.location.assign("/login");
    throw new HttpError("Session expired. Please log in again.", {
      status: 401,
      url,
    });
  }

  if (!res.ok) {
    const raw = await parseErrorPayload(res);
    const normalized = normalizeErrorPayload(raw);
    throw new HttpError(normalized?.message || toFriendlyMessage(res.status), {
      status: res.status,
      url,
      payload: normalized || raw,
    });
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}
