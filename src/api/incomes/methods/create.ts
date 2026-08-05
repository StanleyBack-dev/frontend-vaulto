import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { CreateIncomePayload, Income } from "../schema";

export async function createIncome(
  payload: CreateIncomePayload,
): Promise<Income> {
  try {
    const response = await apiHttp.post<Income>("/incomes", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível criar a receita."),
    );
  }
}
