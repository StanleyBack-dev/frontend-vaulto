import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { CreditCard } from "../schema";

export async function getCreditCardById(
  idCreditCard: string,
): Promise<CreditCard> {
  try {
    const response = await apiHttp.get<CreditCard>(
      `/credit-cards/${idCreditCard}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar o cartão de crédito.",
      ),
    );
  }
}
