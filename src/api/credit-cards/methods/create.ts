import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { CreateCreditCardPayload, CreditCard } from "../schema";

export async function createCreditCard(
  payload: CreateCreditCardPayload,
): Promise<CreditCard> {
  try {
    const response = await apiHttp.post<CreditCard>("/credit-cards", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível criar o cartão de crédito."),
    );
  }
}
