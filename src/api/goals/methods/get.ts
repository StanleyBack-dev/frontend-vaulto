import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { FinancialGoalsResponse, GoalListQueryParams } from "../schema";

export async function getMyFinancialGoals(
  params: GoalListQueryParams = {},
): Promise<FinancialGoalsResponse> {
  try {
    const response = await apiHttp.get<FinancialGoalsResponse>("/goals", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível listar as metas."),
    );
  }
}
