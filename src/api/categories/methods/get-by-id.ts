import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { Category } from "../schema";

export async function getCategoryById(idCategory: string): Promise<Category> {
  try {
    const response = await apiHttp.get<Category>(`/categories/${idCategory}`);
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar a categoria."),
    );
  }
}
