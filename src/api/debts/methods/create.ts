import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { CreateDebtPayload, Debt } from "../schema";

export async function createDebt(payload: CreateDebtPayload): Promise<Debt> {
  try {
    const response = await apiHttp.post<Debt>("/debts", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível criar a dívida."),
    );
  }
}
