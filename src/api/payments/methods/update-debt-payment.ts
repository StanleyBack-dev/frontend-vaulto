import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  UpdateDebtPaymentPayload,
  UpdateDebtPaymentResponse,
} from "../schema";

export async function updateDebtPayment(
  idDebtPayment: string,
  payload: UpdateDebtPaymentPayload,
): Promise<UpdateDebtPaymentResponse> {
  try {
    const response = await apiHttp.patch<UpdateDebtPaymentResponse>(
      `/payments/${idDebtPayment}`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível atualizar o pagamento."),
    );
  }
}
