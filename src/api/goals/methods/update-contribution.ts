import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { FinancialGoal, UpdateGoalContributionPayload } from "../schema";

export async function updateGoalContribution(
  payload: UpdateGoalContributionPayload,
): Promise<FinancialGoal> {
  try {
    const { idFinancialGoal, idGoalContribution, ...body } = payload;
    const response = await apiHttp.patch<FinancialGoal>(
      `/goals/${idFinancialGoal}/contributions/${idGoalContribution}`,
      body,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível atualizar a contribuição."),
    );
  }
}
