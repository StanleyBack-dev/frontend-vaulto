import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { CreditCard, UpdateCreditCardPayload } from "../schema";

export async function updateCreditCard(
  payload: UpdateCreditCardPayload,
): Promise<CreditCard> {
  try {
    const response = await apiHttp.patch<CreditCard>(
      `/credit-cards/${payload.idCreditCard}`,
      {
        name: payload.name,
        creditLimit: payload.creditLimit,
        dueDay: payload.dueDay,
        closingDay: payload.closingDay,
        status: payload.status,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível atualizar o cartão de crédito.",
      ),
    );
  }
}
