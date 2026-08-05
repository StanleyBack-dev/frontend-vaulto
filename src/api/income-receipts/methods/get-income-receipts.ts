import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { IncomeReceipt } from "../schema";

export async function getIncomeReceipts(
  idIncome: string,
): Promise<IncomeReceipt[]> {
  try {
    const response = await apiHttp.get<IncomeReceipt[]>(
      `/income-receipts/incomes/${idIncome}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar os recebimentos."),
    );
  }
}
