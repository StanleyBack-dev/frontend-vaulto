import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { UpdateDebtPaymentResponse } from "../schema";

export async function deleteDebtPayment(
  idDebtPayment: string,
): Promise<UpdateDebtPaymentResponse> {
  try {
    const response = await apiHttp.delete<UpdateDebtPaymentResponse>(
      `/payments/${idDebtPayment}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível excluir o pagamento."),
    );
  }
}
