import { env } from "@/config/env";
import { authStorage } from "@/lib/auth-storage";
import type { ApiResponse } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly payload?: unknown;

  constructor(params: { status: number; message: string; code?: string; payload?: unknown }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.payload = params.payload;
  }
}

type QueryScalar = string | number | boolean | undefined | null;
type QueryValue = QueryScalar | Array<QueryScalar>;

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  query?: Record<string, QueryValue>;
};

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = env.apiBaseUrl.replace(/\/+$/, "");
  const url = new URL(
    path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          if (v !== undefined && v !== null) url.searchParams.append(key, String(v));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as Record<string, unknown>).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return fallback;
}

function extractCode(payload: unknown): string | undefined {
  if (payload && typeof payload === "object" && "code" in payload) {
    const code = (payload as Record<string, unknown>).code;
    if (typeof code === "string") return code;
  }
  return undefined;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, query, headers, ...rest } = options;

  const url = buildUrl(path, query);
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isFormData) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = authStorage.getToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    });
  } catch (cause) {
    throw new ApiError({
      status: 0,
      message: "Không thể kết nối máy chủ",
      payload: cause,
    });
  }

  const text = await response.text();
  const payload = text ? safeParseJson(text) : null;

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      message: extractMessage(payload, response.statusText || "Lỗi không xác định"),
      code: extractCode(payload),
      payload,
    });
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
