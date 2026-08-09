import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { FinancialGoal, UpdateFinancialGoalPayload } from "../schema";

export async function updateFinancialGoal(
  payload: UpdateFinancialGoalPayload,
): Promise<FinancialGoal> {
  try {
    const { idFinancialGoal, ...body } = payload;
    const response = await apiHttp.patch<FinancialGoal>(
      `/goals/${idFinancialGoal}`,
      body,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível atualizar a meta."),
    );
  }
}
