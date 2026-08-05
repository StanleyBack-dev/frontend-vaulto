import axios, { type InternalAxiosRequestConfig } from "axios";

interface ApiErrorPayload {
  message?: string;
  error?: string;
}

interface AxiosLikeError {
  isAxiosError?: boolean;
  message?: string;
  response?: {
    data?: ApiErrorPayload;
  };
}

export const apiHttp = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Paths that must never trigger a refresh-and-retry cycle: retrying them on
// their own 401 would either loop forever (the refresh call itself) or mask
// a genuine "wrong credentials" failure as a silent auth flow.
const REFRESH_EXEMPT_PATHS = ["/auth/session", "/auth/login"];

type AuthRefreshHandler = () => Promise<boolean>;

let authRefreshHandler: AuthRefreshHandler | null = null;
let pendingRefresh: Promise<boolean> | null = null;

export function registerAuthRefreshHandler(
  handler: AuthRefreshHandler | null,
): void {
  authRefreshHandler = handler;
}

function isRefreshExemptUrl(url?: string): boolean {
  if (!url) return false;
  return REFRESH_EXEMPT_PATHS.some((path) => url.includes(path));
}

apiHttp.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as {
      response?: { status?: number };
      config?: RetryableRequestConfig;
    };
    const originalRequest = axiosError.config;

    if (
      axiosError.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshExemptUrl(originalRequest.url) ||
      !authRefreshHandler
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!pendingRefresh) {
      pendingRefresh = authRefreshHandler().finally(() => {
        pendingRefresh = null;
      });
    }

    const refreshed = await pendingRefresh;

    if (!refreshed) {
      return Promise.reject(error);
    }

    return apiHttp(originalRequest);
  },
);

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosLikeError;

  if (axiosError?.isAxiosError) {
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      fallback
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
