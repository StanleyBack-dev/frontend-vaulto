import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  CategoryComparison,
  CategoryComparisonQueryParams,
} from "../schema";

export async function getCategoryComparison(
  params: CategoryComparisonQueryParams = {},
): Promise<CategoryComparison> {
  try {
    const response = await apiHttp.get<CategoryComparison>(
      "/reports/category-comparison",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar o comparativo."),
    );
  }
}
