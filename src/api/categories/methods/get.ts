import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { CategoryListQueryParams, CategoriesResponse } from "../schema";

export async function getMyCategories(
  params: CategoryListQueryParams = {},
): Promise<CategoriesResponse> {
  try {
    const response = await apiHttp.get<CategoriesResponse>("/categories", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível listar categorias."),
    );
  }
}
