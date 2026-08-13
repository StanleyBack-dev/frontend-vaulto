import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { SupportMessageStatus } from "../schema";

export async function getMySupportMessageStatus(): Promise<SupportMessageStatus> {
  try {
    const response = await apiHttp.get<SupportMessageStatus>("/support/status");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível verificar o status do suporte.",
      ),
    );
  }
}
