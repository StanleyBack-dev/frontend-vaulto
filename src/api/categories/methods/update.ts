import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { Category, UpdateCategoryPayload } from "../schema";

export async function updateCategory(
  payload: UpdateCategoryPayload,
): Promise<Category> {
  try {
    const response = await apiHttp.patch<Category>(
      `/categories/${payload.idCategory}`,
      {
        name: payload.name,
        status: payload.status,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível atualizar a categoria."),
    );
  }
}
