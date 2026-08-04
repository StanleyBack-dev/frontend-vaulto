import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { Category, CreateCategoryPayload } from "../schema";

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<Category> {
  try {
    const response = await apiHttp.post<Category>("/categories", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível criar a categoria."),
    );
  }
}
