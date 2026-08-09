import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { FinancialGoal } from "../schema";

export async function deleteGoalContribution(
  idFinancialGoal: string,
  idGoalContribution: string,
): Promise<FinancialGoal> {
  try {
    const response = await apiHttp.delete<FinancialGoal>(
      `/goals/${idFinancialGoal}/contributions/${idGoalContribution}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível excluir a contribuição."),
    );
  }
}
