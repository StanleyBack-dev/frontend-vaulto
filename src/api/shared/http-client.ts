import axios from "axios";

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
