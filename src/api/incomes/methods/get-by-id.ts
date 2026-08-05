import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { Income } from "../schema";

export async function getIncomeById(idIncome: string): Promise<Income> {
  try {
    const response = await apiHttp.get<Income>(`/incomes/${idIncome}`);
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar a receita."),
    );
  }
}
