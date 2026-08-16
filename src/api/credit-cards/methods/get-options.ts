import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { CreditCardListQueryParams, CreditCardsResponse } from "../schema";

export async function getMyCreditCardOptions(
  params: CreditCardListQueryParams = {},
): Promise<CreditCardsResponse> {
  try {
    const response = await apiHttp.get<CreditCardsResponse>(
      "/credit-cards/options",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível listar cartões de crédito."),
    );
  }
}
