import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { Subscription } from "../schema";

export async function getMySubscription(): Promise<Subscription> {
  try {
    const response = await apiHttp.get<Subscription>("/billing");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar sua assinatura."),
    );
  }
}
