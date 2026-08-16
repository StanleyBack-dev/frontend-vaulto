import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  CategoryAmountQueryParams,
  MonthlyCashflowPoint,
} from "../schema";

export async function getMonthlyCashflowTrend(
  params: CategoryAmountQueryParams,
): Promise<MonthlyCashflowPoint[]> {
  try {
    const response = await apiHttp.get<MonthlyCashflowPoint[]>(
      "/reports/monthly-cashflow-trend",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar o relatório."),
    );
  }
}
