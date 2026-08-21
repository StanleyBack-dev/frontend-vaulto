import axios, { type InternalAxiosRequestConfig } from "axios";
import { setSystemDown } from "../../shared/system-status/system-status-events";

interface ApiErrorPayload {
  message?: string;
  error?: string;
  code?: string;
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

let termsGateOpen = true;
let termsGateWaiters: Array<() => void> = [];

const TERMS_GATE_EXEMPT_PATHS = [
  "/auth/session",
  "/auth/login",
  "/legal/accept-terms",
];

export function setTermsGateOpen(open: boolean): void {
  termsGateOpen = open;

  if (open && termsGateWaiters.length > 0) {
    const waiters = termsGateWaiters;
    termsGateWaiters = [];
    waiters.forEach((resolve) => resolve());
  }
}

function isTermsGateExemptUrl(url?: string): boolean {
  if (!url) return false;
  return TERMS_GATE_EXEMPT_PATHS.some((path) => url.includes(path));
}

function waitForTermsGate(): Promise<void> {
  if (termsGateOpen) return Promise.resolve();

  return new Promise((resolve) => {
    termsGateWaiters.push(resolve);
  });
}

apiHttp.interceptors.request.use(async (config) => {
  if (!isTermsGateExemptUrl(config.url)) {
    await waitForTermsGate();
  }

  return config;
});

apiHttp.interceptors.response.use(
  (response) => {
    setSystemDown(false);
    return response;
  },
  async (error: unknown) => {
    const axiosError = error as {
      response?: { status?: number; data?: ApiErrorPayload };
      config?: RetryableRequestConfig;
    };
    const originalRequest = axiosError.config;

    const isBackendUnreachable =
      !axiosError.response ||
      axiosError.response.data?.code === "BACKEND_UNREACHABLE";
    setSystemDown(isBackendUnreachable);

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

export function getApiErrorCode(error: unknown): string | undefined {
  const axiosError = error as AxiosLikeError;
  return axiosError?.isAxiosError ? axiosError.response?.data?.code : undefined;
}
