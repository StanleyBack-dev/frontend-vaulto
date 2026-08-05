import { z } from "zod";
import type { ListQueryParams, PaginatedResponse } from "../shared/contracts";

export const IncomeTypeSchema = z.enum(["FIXED", "VARIABLE"]);
export const IncomeStatusSchema = z.enum([
  "PENDING",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "OVERDUE",
]);

export const IncomeInstallmentSchema = z.object({
  idIncomeInstallment: z.string(),
  idIncome: z.string(),
  installmentNumber: z.number(),
  amountDue: z.number(),
  amountReceived: z.number(),
  dueDate: z.string(),
  receivedAt: z.string().nullable().optional(),
  status: IncomeStatusSchema,
});

export const IncomeSchema = z.object({
  idIncome: z.string(),
  idCategory: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  incomeType: IncomeTypeSchema,
  totalAmount: z.number(),
  dueDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  startDate: z.string().optional(),
  hasInstallments: z.boolean(),
  installmentCount: z.number().nullable().optional(),
  isRecurring: z.boolean(),
  status: IncomeStatusSchema,
  receivedAt: z.string().nullable().optional(),
  installments: z.array(IncomeInstallmentSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateIncomePayloadSchema = z
  .object({
    title: z.string().min(1),
    idCategory: z.string().min(1),
    description: z.string().optional(),
    incomeType: IncomeTypeSchema,
    totalAmount: z.number().positive(),
    dueDate: z.string().optional(),
    hasInstallments: z.boolean(),
    installmentCount: z.number().int().positive().optional(),
    installmentAmount: z.number().positive().optional(),
    isRecurring: z.boolean().optional(),
  })
  .superRefine((payload, context) => {
    if (payload.hasInstallments) {
      if (!payload.installmentCount || payload.installmentCount < 2) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["installmentCount"],
          message: "Informe uma quantidade válida de parcelas.",
        });
      }
      return;
    }

    if (payload.installmentCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installmentCount"],
        message: "Parcelamento só pode ser informado para receitas parceladas.",
      });
    }

    if (payload.installmentAmount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installmentAmount"],
        message:
          "Valor de parcela só pode ser informado para receitas parceladas.",
      });
    }
  });

export const UpdateIncomeStatusPayloadSchema = z.object({
  idIncome: z.string().min(1),
  status: IncomeStatusSchema,
});

export const UpdateIncomeDetailsPayloadSchema = z.object({
  idIncome: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  idCategory: z.string().min(1).optional(),
  incomeType: IncomeTypeSchema.optional(),
  dueDate: z.string().optional(),
  totalAmount: z.number().positive().optional(),
  isRecurring: z.boolean().optional(),
});

export interface IncomeListQueryParams extends ListQueryParams {
  status?: IncomeStatus;
  incomeType?: IncomeType;
  idCategory?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export type IncomeType = z.infer<typeof IncomeTypeSchema>;
export type IncomeStatus = z.infer<typeof IncomeStatusSchema>;
export type IncomeInstallment = z.infer<typeof IncomeInstallmentSchema>;
export type Income = z.infer<typeof IncomeSchema>;
export type CreateIncomePayload = z.infer<typeof CreateIncomePayloadSchema>;
export type UpdateIncomeStatusPayload = z.infer<
  typeof UpdateIncomeStatusPayloadSchema
>;
export type UpdateIncomeDetailsPayload = z.infer<
  typeof UpdateIncomeDetailsPayloadSchema
>;
export type IncomesResponse = PaginatedResponse<Income>;
