import { apiHttp, getApiErrorMessage } from "../../shared/http-client";

export async function deleteIncome(idIncome: string): Promise<void> {
  try {
    await apiHttp.delete(`/incomes/${idIncome}`);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível excluir a receita."),
    );
  }
}
