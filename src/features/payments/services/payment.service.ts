import { registerInstallmentPayment } from "@/api/payments/methods/register-installment-payment";
import { getDebtPayments } from "@/api/payments/methods/get-debt-payments";
import { updateDebtPayment as updateDebtPaymentRequest } from "@/api/payments/methods/update-debt-payment";
import { deleteDebtPayment as deleteDebtPaymentRequest } from "@/api/payments/methods/delete-debt-payment";
import {
  RegisterInstallmentPaymentPayloadSchema,
  RegisterInstallmentPaymentResponseSchema,
  UpdateDebtPaymentPayloadSchema,
  UpdateDebtPaymentResponseSchema,
  type RegisterInstallmentPaymentPayload,
  type RegisterInstallmentPaymentResponse,
  type UpdateDebtPaymentPayload,
  type UpdateDebtPaymentResponse,
} from "@/api/payments/schema";
import { DebtPaymentSchema, type DebtPayment } from "@/api/debts/schema";
import { paymentUiCopy } from "../model/messages";

export async function payInstallment(
  payload: RegisterInstallmentPaymentPayload,
): Promise<RegisterInstallmentPaymentResponse> {
  const parsedPayload =
    RegisterInstallmentPaymentPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(paymentUiCopy.errors.invalidPaymentData);
  }

  const response = await registerInstallmentPayment(parsedPayload.data);
  const parsedResponse =
    RegisterInstallmentPaymentResponseSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(paymentUiCopy.errors.invalidResponseData);
  }

  return parsedResponse.data;
}

export async function fetchDebtPayments(
  idDebt: string,
): Promise<DebtPayment[]> {
  const response = await getDebtPayments(idDebt);
  const parsed = DebtPaymentSchema.array().safeParse(response);

  if (!parsed.success) {
    throw new Error(paymentUiCopy.errors.invalidResponseData);
  }

  return parsed.data;
}

export async function updateDebtPayment(
  idDebtPayment: string,
  payload: UpdateDebtPaymentPayload,
): Promise<UpdateDebtPaymentResponse> {
  const parsedPayload = UpdateDebtPaymentPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(paymentUiCopy.errors.invalidPaymentData);
  }

  const response = await updateDebtPaymentRequest(
    idDebtPayment,
    parsedPayload.data,
  );
  const parsedResponse = UpdateDebtPaymentResponseSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(paymentUiCopy.errors.invalidResponseData);
  }

  return parsedResponse.data;
}

export async function deleteDebtPayment(
  idDebtPayment: string,
): Promise<UpdateDebtPaymentResponse> {
  const response = await deleteDebtPaymentRequest(idDebtPayment);
  const parsedResponse = UpdateDebtPaymentResponseSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(paymentUiCopy.errors.invalidResponseData);
  }

  return parsedResponse.data;
}
