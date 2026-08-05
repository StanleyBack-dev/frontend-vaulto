import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  RegisterInstallmentReceiptPayload,
  RegisterInstallmentReceiptResponse,
} from "../schema";

export async function registerInstallmentReceipt(
  payload: RegisterInstallmentReceiptPayload,
): Promise<RegisterInstallmentReceiptResponse> {
  try {
    const response = await apiHttp.post<RegisterInstallmentReceiptResponse>(
      `/income-receipts/installments/${payload.idIncomeInstallment}`,
      {
        idIncome: payload.idIncome,
        amountReceived: payload.amountReceived,
        receivedAt: payload.receivedAt,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível registrar o recebimento."),
    );
  }
}
