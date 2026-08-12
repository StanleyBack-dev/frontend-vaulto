import { apiHttp, getApiErrorMessage } from "../../shared/http-client";

export type ExportFormat = "pdf" | "xlsx";

export type ExportResourcePath =
  | "debts"
  | "payments"
  | "incomes"
  | "income-receipts"
  | "credit-cards"
  | "categories"
  | "statement"
  | "goals"
  | "goal-contributions";

export interface ExportDownloadResult {
  blob: Blob;
  filename: string;
}

function extractFilename(
  contentDisposition: string | undefined,
  fallback: string,
): string {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? fallback;
}

async function parseBlobErrorMessage(
  data: unknown,
  fallback: string,
): Promise<string> {
  if (!(data instanceof Blob)) {
    return fallback;
  }

  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as { message?: string; error?: string };
    return parsed.message || parsed.error || fallback;
  } catch {
    return fallback;
  }
}

export async function downloadExport(
  resource: ExportResourcePath,
  format: ExportFormat,
  filters: Record<string, string | undefined> = {},
): Promise<ExportDownloadResult> {
  const params: Record<string, string> = { format };
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params[key] = value;
    }
  }

  const fallbackMessage = "Não foi possível gerar o arquivo de exportação.";

  try {
    const response = await apiHttp.get(`/exports/${resource}`, {
      params,
      responseType: "blob",
    });

    return {
      blob: response.data as Blob,
      filename: extractFilename(
        response.headers["content-disposition"],
        `${resource}.${format}`,
      ),
    };
  } catch (error) {
    const axiosError = error as {
      isAxiosError?: boolean;
      response?: { data?: unknown };
    };

    if (axiosError?.isAxiosError && axiosError.response?.data instanceof Blob) {
      throw new Error(
        await parseBlobErrorMessage(axiosError.response.data, fallbackMessage),
      );
    }

    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
}
