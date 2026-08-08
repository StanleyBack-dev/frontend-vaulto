import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { Subscription } from "../schema";

export async function cancelSubscription(): Promise<Subscription> {
  try {
    const response = await apiHttp.post<Subscription>("/billing/cancel");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível cancelar a assinatura."),
    );
  }
}
