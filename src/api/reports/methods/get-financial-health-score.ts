import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  FinancialHealthScore,
  FinancialHealthScoreQueryParams,
} from "../schema";

export async function getFinancialHealthScore(
  params: FinancialHealthScoreQueryParams = {},
): Promise<FinancialHealthScore> {
  try {
    const response = await apiHttp.get<FinancialHealthScore>(
      "/reports/health-score",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível calcular a saúde financeira.",
      ),
    );
  }
}
