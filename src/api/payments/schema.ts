import { z } from "zod";
import {
  DebtInstallmentSchema,
  DebtPaymentSchema,
  DebtStatusSchema,
} from "../debts/schema";

export const RegisterInstallmentPaymentPayloadSchema = z.object({
  idDebt: z.string().min(1),
  idDebtInstallment: z.string().min(1),
  amountPaid: z.number().positive(),
  paidAt: z.string().optional(),
});

export const RegisterInstallmentPaymentResponseSchema = z.object({
  idDebt: z.string(),
  debtStatus: DebtStatusSchema,
  payments: z.array(DebtPaymentSchema).default([]),
  installments: z.array(DebtInstallmentSchema).default([]),
});

export type RegisterInstallmentPaymentPayload = z.infer<
  typeof RegisterInstallmentPaymentPayloadSchema
>;
export type RegisterInstallmentPaymentResponse = z.infer<
  typeof RegisterInstallmentPaymentResponseSchema
>;

export const UpdateDebtPaymentPayloadSchema = z.object({
  amountPaid: z.number().positive().optional(),
  paidAt: z.string().optional(),
});

export type UpdateDebtPaymentPayload = z.infer<
  typeof UpdateDebtPaymentPayloadSchema
>;

export const UpdateDebtPaymentResponseSchema =
  RegisterInstallmentPaymentResponseSchema;
export type UpdateDebtPaymentResponse = z.infer<
  typeof UpdateDebtPaymentResponseSchema
>;
