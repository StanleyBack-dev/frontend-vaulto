import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { DebtPayment } from "../../debts/schema";

export async function getDebtPayments(idDebt: string): Promise<DebtPayment[]> {
  try {
    const response = await apiHttp.get<DebtPayment[]>(
      `/payments/debts/${idDebt}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar os pagamentos."),
    );
  }
}
