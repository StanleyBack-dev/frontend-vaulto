import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { FinancialGoal } from "../schema";

export async function getFinancialGoalById(
  idFinancialGoal: string,
): Promise<FinancialGoal> {
  try {
    const response = await apiHttp.get<FinancialGoal>(
      `/goals/${idFinancialGoal}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar a meta."),
    );
  }
}
