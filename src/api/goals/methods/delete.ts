import { apiHttp, getApiErrorMessage } from "../../shared/http-client";

export async function deleteFinancialGoal(
  idFinancialGoal: string,
): Promise<void> {
  try {
    await apiHttp.delete(`/goals/${idFinancialGoal}`);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível excluir a meta."),
    );
  }
}
