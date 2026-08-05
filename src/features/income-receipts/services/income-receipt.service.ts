import { registerInstallmentReceipt } from "@/api/income-receipts/methods/register-installment-receipt";
import { getIncomeReceipts } from "@/api/income-receipts/methods/get-income-receipts";
import { updateIncomeReceipt as updateIncomeReceiptRequest } from "@/api/income-receipts/methods/update-income-receipt";
import { deleteIncomeReceipt as deleteIncomeReceiptRequest } from "@/api/income-receipts/methods/delete-income-receipt";
import {
  RegisterInstallmentReceiptPayloadSchema,
  RegisterInstallmentReceiptResponseSchema,
  UpdateIncomeReceiptPayloadSchema,
  UpdateIncomeReceiptResponseSchema,
  type RegisterInstallmentReceiptPayload,
  type RegisterInstallmentReceiptResponse,
  type UpdateIncomeReceiptPayload,
  type UpdateIncomeReceiptResponse,
} from "@/api/income-receipts/schema";
import { IncomeReceiptSchema, type IncomeReceipt } from "@/api/income-receipts/schema";
import { incomeReceiptUiCopy } from "../model/messages";

export async function receiveInstallment(
  payload: RegisterInstallmentReceiptPayload,
): Promise<RegisterInstallmentReceiptResponse> {
  const parsedPayload =
    RegisterInstallmentReceiptPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(incomeReceiptUiCopy.errors.invalidReceiptData);
  }

  const response = await registerInstallmentReceipt(parsedPayload.data);
  const parsedResponse =
    RegisterInstallmentReceiptResponseSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(incomeReceiptUiCopy.errors.invalidResponseData);
  }

  return parsedResponse.data;
}

export async function fetchIncomeReceipts(
  idIncome: string,
): Promise<IncomeReceipt[]> {
  const response = await getIncomeReceipts(idIncome);
  const parsed = IncomeReceiptSchema.array().safeParse(response);

  if (!parsed.success) {
    throw new Error(incomeReceiptUiCopy.errors.invalidResponseData);
  }

  return parsed.data;
}

export async function updateIncomeReceipt(
  idIncomeReceipt: string,
  payload: UpdateIncomeReceiptPayload,
): Promise<UpdateIncomeReceiptResponse> {
  const parsedPayload = UpdateIncomeReceiptPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(incomeReceiptUiCopy.errors.invalidReceiptData);
  }

  const response = await updateIncomeReceiptRequest(
    idIncomeReceipt,
    parsedPayload.data,
  );
  const parsedResponse = UpdateIncomeReceiptResponseSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(incomeReceiptUiCopy.errors.invalidResponseData);
  }

  return parsedResponse.data;
}

export async function deleteIncomeReceipt(
  idIncomeReceipt: string,
): Promise<UpdateIncomeReceiptResponse> {
  const response = await deleteIncomeReceiptRequest(idIncomeReceipt);
  const parsedResponse = UpdateIncomeReceiptResponseSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(incomeReceiptUiCopy.errors.invalidResponseData);
  }

  return parsedResponse.data;
}
