import {
  apiHttp,
  getApiErrorCode,
  getApiErrorMessage,
} from "../../shared/http-client";
import {
  PLAN_LIMIT_REACHED_CODE,
  PlanLimitReachedError,
} from "../../shared/plan-limit-error";
import type { CreateCreditCardPayload, CreditCard } from "../schema";

export async function createCreditCard(
  payload: CreateCreditCardPayload,
): Promise<CreditCard> {
  try {
    const response = await apiHttp.post<CreditCard>("/credit-cards", payload);
    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      "Não foi possível criar o cartão de crédito.",
    );

    if (getApiErrorCode(error) === PLAN_LIMIT_REACHED_CODE) {
      throw new PlanLimitReachedError(message);
    }

    throw new Error(message);
  }
}
