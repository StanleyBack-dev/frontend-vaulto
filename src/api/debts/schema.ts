import { z } from "zod";
import type { ListQueryParams, PaginatedResponse } from "../shared/contracts";

export const DebtTypeSchema = z.enum(["FIXED", "VARIABLE"]);
export const DebtStatusSchema = z.enum([
  "OPEN",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
]);

export const DebtPaymentSchema = z.object({
  idDebtPayment: z.string().optional(),
  idDebt: z.string().optional(),
  idDebtInstallment: z.string().nullable().optional(),
  idUsers: z.string().optional(),
  amountPaid: z.number(),
  paidAt: z.string(),
  createdAt: z.string().optional(),
});

export const DebtInstallmentSchema = z.object({
  idDebtInstallment: z.string(),
  idDebt: z.string(),
  installmentNumber: z.number(),
  amountDue: z.number(),
  amountPaid: z.number(),
  dueDate: z.string(),
  paidAt: z.string().nullable().optional(),
  status: DebtStatusSchema,
});

export const DebtSchema = z.object({
  idDebt: z.string(),
  idCategory: z.string(),
  title: z.string(),
  category: z.string(),
  idCreditCard: z.string().nullable().optional(),
  creditCard: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  debtType: DebtTypeSchema,
  totalAmount: z.number(),
  dueDate: z.string().nullable().optional(),
  acquiredAt: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  startDate: z.string().optional(),
  hasInstallments: z.boolean(),
  installmentCount: z.number().nullable().optional(),
  status: DebtStatusSchema,
  installments: z.array(DebtInstallmentSchema).default([]),
  payments: z.array(DebtPaymentSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateDebtPayloadSchema = z
  .object({
    title: z.string().min(1),
    idCategory: z.string().min(1),
    idCreditCard: z.string().optional(),
    description: z.string().optional(),
    debtType: DebtTypeSchema,
    totalAmount: z.number().positive(),
    dueDate: z.string().optional(),
    acquiredAt: z.string().optional(),
    hasInstallments: z.boolean(),
    installmentCount: z.number().int().positive().optional(),
    installmentAmount: z.number().positive().optional(),
  })
  .superRefine((payload, context) => {
    if (payload.hasInstallments) {
      if (!payload.installmentCount || payload.installmentCount < 2) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["installmentCount"],
          message: "Informe uma quantidade valida de parcelas.",
        });
      }
      return;
    }

    if (payload.installmentCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installmentCount"],
        message: "Parcelamento só pode ser informado para dívidas parceladas.",
      });
    }

    if (payload.installmentAmount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installmentAmount"],
        message:
          "Valor de parcela só pode ser informado para dívidas parceladas.",
      });
    }
  });

export const UpdateDebtStatusPayloadSchema = z.object({
  idDebt: z.string().min(1),
  status: DebtStatusSchema,
});

export const UpdateDebtDetailsPayloadSchema = z.object({
  idDebt: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  idCategory: z.string().min(1).optional(),
  debtType: DebtTypeSchema.optional(),
  acquiredAt: z.string().optional(),
  dueDate: z.string().optional(),
  totalAmount: z.number().positive().optional(),
});

export interface DebtListQueryParams extends ListQueryParams {
  status?: DebtStatus;
  debtType?: DebtType;
  idCategory?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export type DebtType = z.infer<typeof DebtTypeSchema>;
export type DebtStatus = z.infer<typeof DebtStatusSchema>;
export type DebtPayment = z.infer<typeof DebtPaymentSchema>;
export type DebtInstallment = z.infer<typeof DebtInstallmentSchema>;
export type Debt = z.infer<typeof DebtSchema>;
export type CreateDebtPayload = z.infer<typeof CreateDebtPayloadSchema>;
export type UpdateDebtStatusPayload = z.infer<
  typeof UpdateDebtStatusPayloadSchema
>;
export type UpdateDebtDetailsPayload = z.infer<
  typeof UpdateDebtDetailsPayloadSchema
>;
export type DebtsResponse = PaginatedResponse<Debt>;
