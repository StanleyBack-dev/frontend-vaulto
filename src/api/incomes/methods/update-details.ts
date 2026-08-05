import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { Income, UpdateIncomeDetailsPayload } from "../schema";

export async function updateIncomeDetails(
  payload: UpdateIncomeDetailsPayload,
): Promise<Income> {
  try {
    const response = await apiHttp.patch<Income>(
      `/incomes/${payload.idIncome}/details`,
      {
        title: payload.title,
        description: payload.description,
        idCategory: payload.idCategory,
        incomeType: payload.incomeType,
        expectedAmount: payload.expectedAmount,
        expectedDate: payload.expectedDate,
        receivedAmount: payload.receivedAmount,
        receivedAt: payload.receivedAt,
        isRecurring: payload.isRecurring,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível atualizar a receita."),
    );
  }
}
