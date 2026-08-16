import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { CategoryAmountQueryParams, CategoryAmountRow } from "../schema";

export async function getDebtsAmountByCategory(
  params: CategoryAmountQueryParams,
): Promise<CategoryAmountRow[]> {
  try {
    const response = await apiHttp.get<CategoryAmountRow[]>(
      "/reports/debts-by-category",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar o relatório."),
    );
  }
}
