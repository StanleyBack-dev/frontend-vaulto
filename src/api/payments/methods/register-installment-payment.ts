import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  RegisterInstallmentPaymentPayload,
  RegisterInstallmentPaymentResponse,
} from "../schema";

export async function registerInstallmentPayment(
  payload: RegisterInstallmentPaymentPayload,
): Promise<RegisterInstallmentPaymentResponse> {
  try {
    const response = await apiHttp.post<RegisterInstallmentPaymentResponse>(
      `/payments/installments/${payload.idDebtInstallment}`,
      {
        idDebt: payload.idDebt,
        amountPaid: payload.amountPaid,
        paidAt: payload.paidAt,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível registrar o pagamento."),
    );
  }
}
