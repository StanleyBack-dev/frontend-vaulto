import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { SubscribeToProPayload, SubscribeToProResponse } from "../schema";

export async function subscribeToPro(
  payload: SubscribeToProPayload,
): Promise<SubscribeToProResponse> {
  try {
    const response = await apiHttp.post<SubscribeToProResponse>(
      "/billing/subscribe",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível iniciar a assinatura."),
    );
  }
}
