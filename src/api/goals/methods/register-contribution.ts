import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { FinancialGoal, RegisterGoalContributionPayload } from "../schema";

export async function registerGoalContribution(
  payload: RegisterGoalContributionPayload,
): Promise<FinancialGoal> {
  try {
    const { idFinancialGoal, ...body } = payload;
    const response = await apiHttp.post<FinancialGoal>(
      `/goals/${idFinancialGoal}/contributions`,
      body,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível registrar a contribuição."),
    );
  }
}
