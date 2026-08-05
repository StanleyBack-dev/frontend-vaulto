import { apiHttp, getApiErrorMessage } from "../../shared/http-client";

export async function deleteDebt(idDebt: string): Promise<void> {
  try {
    await apiHttp.delete(`/debts/${idDebt}`);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível excluir a dívida."),
    );
  }
}
