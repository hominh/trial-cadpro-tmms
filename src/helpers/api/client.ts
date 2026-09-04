import axios, { AxiosError } from "axios";

const useLocalMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"
  || (process.env.NEXT_PUBLIC_USE_MOCK_API === undefined && process.env.NODE_ENV === "development");

export interface NormalizedApiError {
  readonly status?: number;
  readonly code?: string;
  readonly message: string;
  readonly cancelled: boolean;
  readonly retryAfterSeconds?: number;
}

export const apiClient = axios.create({
  baseURL: useLocalMockApi ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"),
  timeout: 10_000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isCancel(error)) return { message: "Request cancelled", cancelled: true };
  if (error instanceof AxiosError) {
    const data = error.response?.data as { code?: string; detail?: string; title?: string } | undefined;
    const retry = Number(error.response?.headers["retry-after"]);
    return {
      status: error.response?.status,
      code: data?.code,
      message: data?.detail ?? data?.title ?? error.message,
      cancelled: false,
      ...(Number.isFinite(retry) ? { retryAfterSeconds: retry } : {}),
    };
  }
  return { message: error instanceof Error ? error.message : "Unknown API error", cancelled: false };
}
