import { ApiErrorPayload } from "@/features/api/strapiTypes";
import { tokenStore } from "@/features/auth/tokenStore";

export const DEFAULT_STRAPI_URL = "http://localhost:1337";

export function getStrapiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_STRAPI_URL?.trim() ||
    DEFAULT_STRAPI_URL
  );
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
  tokenStore.setToken(null);
}

// Internal refresh logic to avoid circular dependency with authApi
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function attemptRefresh(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  console.log("Starting silent refresh attempt...");
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      // Use credentials: 'include' to send the HttpOnly refreshToken cookie
      const response = await fetchJson<{ jwt: string }>("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      console.log("Silent refresh successful. New token received.");
      tokenStore.setToken(response.jwt);
      return response.jwt;
    } catch (error) {
      console.error("Silent refresh failed:", error);
      tokenStore.setToken(null);
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
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

  let token = tokenStore.getToken();
  const url = toAbsoluteUrl(pathOrUrl);

  const makeRequest = async (authToken: string | null) => {
    return fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(init?.headers || {}),
      },
    });
  };

  let res = await makeRequest(token);

  // If 401, try to refresh and retry ONCE
  if (res.status === 401) {
    // Parse the error payload first to decide whether token is actually expired
    let normalized401: ApiErrorPayload | undefined;
    try {
      const raw = await parseErrorPayload(res);
      normalized401 = normalizeErrorPayload(raw);
    } catch {
      normalized401 = undefined;
    }
    const msg = (normalized401?.message || "").toLowerCase();
    const looksExpired =
      msg.includes("expired") ||
      msg.includes("token expired") ||
      msg.includes("jwt expired");

    if (looksExpired) {
      console.warn(`401 from ${url} indicates expired token. Attempting refresh...`);
      try {
        const newToken = await attemptRefresh();
        res = await makeRequest(newToken);
      } catch (refreshError) {
        console.error("Refresh failed during 401 handling. Keeping on page for debugging.", refreshError);
        clearClientAuthStorage();
        // Auto-redirect disabled to allow investigating logs and network
        throw new HttpError("Session expired. Please log in again.", {
          status: 401,
          url,
          payload: normalized401,
        });
      }
    } else {
      // Not an expiration-related 401; do not try refresh to avoid 404 loops
      throw new HttpError(normalized401?.message || toFriendlyMessage(401), {
        status: 401,
        url,
        payload: normalized401,
      });
    }
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
