import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { SendSupportMessagePayload, SupportMessage } from "../schema";

export async function sendSupportMessage(
  payload: SendSupportMessagePayload,
): Promise<SupportMessage> {
  try {
    const response = await apiHttp.post<SupportMessage>("/support", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível enviar sua mensagem."),
    );
  }
}
