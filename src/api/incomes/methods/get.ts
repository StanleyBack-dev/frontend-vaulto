import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { IncomeListQueryParams, IncomesResponse } from "../schema";

export async function getMyIncomes(
  params: IncomeListQueryParams = {},
): Promise<IncomesResponse> {
  try {
    const response = await apiHttp.get<IncomesResponse>("/incomes", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível listar receitas."),
    );
  }
}
