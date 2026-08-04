import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { DebtListQueryParams, DebtsResponse } from "../schema";

export async function getMyDebts(
  params: DebtListQueryParams = {},
): Promise<DebtsResponse> {
  try {
    const response = await apiHttp.get<DebtsResponse>("/debts", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível listar dívidas."),
    );
  }
}
