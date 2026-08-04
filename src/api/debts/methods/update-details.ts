import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { Debt, UpdateDebtDetailsPayload } from "../schema";

export async function updateDebtDetails(
  payload: UpdateDebtDetailsPayload,
): Promise<Debt> {
  try {
    const response = await apiHttp.patch<Debt>(
      `/debts/${payload.idDebt}/details`,
      {
        title: payload.title,
        description: payload.description,
        idCategory: payload.idCategory,
        debtType: payload.debtType,
        acquiredAt: payload.acquiredAt,
        dueDate: payload.dueDate,
        totalAmount: payload.totalAmount,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível atualizar a dívida."),
    );
  }
}
