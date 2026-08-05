import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { Income, UpdateIncomeStatusPayload } from "../schema";

export async function updateIncomeStatus(
  payload: UpdateIncomeStatusPayload,
): Promise<Income> {
  try {
    const response = await apiHttp.patch<Income>(
      `/incomes/${payload.idIncome}/status`,
      { status: payload.status },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível atualizar o status."),
    );
  }
}
