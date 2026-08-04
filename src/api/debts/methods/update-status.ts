import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { Debt, UpdateDebtStatusPayload } from "../schema";

export async function updateDebtStatus(
  payload: UpdateDebtStatusPayload,
): Promise<Debt> {
  try {
    const response = await apiHttp.patch<Debt>(
      `/debts/${payload.idDebt}/status`,
      { status: payload.status },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível atualizar o status."),
    );
  }
}
