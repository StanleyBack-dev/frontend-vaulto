import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { UpdateIncomeReceiptResponse } from "../schema";

export async function deleteIncomeReceipt(
  idIncomeReceipt: string,
): Promise<UpdateIncomeReceiptResponse> {
  try {
    const response = await apiHttp.delete<UpdateIncomeReceiptResponse>(
      `/income-receipts/${idIncomeReceipt}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível excluir o recebimento."),
    );
  }
}
