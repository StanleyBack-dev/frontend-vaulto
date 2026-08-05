import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  UpdateIncomeReceiptPayload,
  UpdateIncomeReceiptResponse,
} from "../schema";

export async function updateIncomeReceipt(
  idIncomeReceipt: string,
  payload: UpdateIncomeReceiptPayload,
): Promise<UpdateIncomeReceiptResponse> {
  try {
    const response = await apiHttp.patch<UpdateIncomeReceiptResponse>(
      `/income-receipts/${idIncomeReceipt}`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível atualizar o recebimento."),
    );
  }
}
