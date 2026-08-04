import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { CreditCardListQueryParams, CreditCardsResponse } from "../schema";

export async function getMyCreditCards(
  params: CreditCardListQueryParams = {},
): Promise<CreditCardsResponse> {
  try {
    const response = await apiHttp.get<CreditCardsResponse>("/credit-cards", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível listar cartões de crédito."),
    );
  }
}
