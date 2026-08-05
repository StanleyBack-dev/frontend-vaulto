import { z } from "zod";
import {
  IncomeInstallmentSchema,
  IncomeStatusSchema,
} from "../incomes/schema";

export const IncomeReceiptSchema = z.object({
  idIncomeReceipt: z.string().optional(),
  idIncome: z.string().optional(),
  idIncomeInstallment: z.string().nullable().optional(),
  idUsers: z.string().optional(),
  amountReceived: z.number(),
  receivedAt: z.string(),
  createdAt: z.string().optional(),
});

export const RegisterInstallmentReceiptPayloadSchema = z.object({
  idIncome: z.string().min(1),
  idIncomeInstallment: z.string().min(1),
  amountReceived: z.number().positive(),
  receivedAt: z.string().optional(),
});

export const RegisterInstallmentReceiptResponseSchema = z.object({
  idIncome: z.string(),
  incomeStatus: IncomeStatusSchema,
  receipts: z.array(IncomeReceiptSchema).default([]),
  installments: z.array(IncomeInstallmentSchema).default([]),
});

export type IncomeReceipt = z.infer<typeof IncomeReceiptSchema>;
export type RegisterInstallmentReceiptPayload = z.infer<
  typeof RegisterInstallmentReceiptPayloadSchema
>;
export type RegisterInstallmentReceiptResponse = z.infer<
  typeof RegisterInstallmentReceiptResponseSchema
>;

export const UpdateIncomeReceiptPayloadSchema = z.object({
  amountReceived: z.number().positive().optional(),
  receivedAt: z.string().optional(),
});

export type UpdateIncomeReceiptPayload = z.infer<
  typeof UpdateIncomeReceiptPayloadSchema
>;

export const UpdateIncomeReceiptResponseSchema =
  RegisterInstallmentReceiptResponseSchema;
export type UpdateIncomeReceiptResponse = z.infer<
  typeof UpdateIncomeReceiptResponseSchema
>;
