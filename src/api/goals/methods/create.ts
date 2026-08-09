import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { CreateFinancialGoalPayload, FinancialGoal } from "../schema";

export async function createFinancialGoal(
  payload: CreateFinancialGoalPayload,
): Promise<FinancialGoal> {
  try {
    const response = await apiHttp.post<FinancialGoal>("/goals", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível criar a meta."),
    );
  }
}
