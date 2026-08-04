import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { Debt } from "../schema";

export async function getDebtById(idDebt: string): Promise<Debt> {
  try {
    const response = await apiHttp.get<Debt>(`/debts/${idDebt}`);
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar a dívida."),
    );
  }
}
