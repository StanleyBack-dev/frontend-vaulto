import { z } from "zod";
import type { ListQueryParams, PaginatedResponse } from "../shared/contracts";

export const IncomeTypeSchema = z.enum(["FIXED", "VARIABLE"]);
export const IncomeStatusSchema = z.enum([
  "PENDING",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "OVERDUE",
]);

export const IncomeSchema = z.object({
  idIncome: z.string(),
  idCategory: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  incomeType: IncomeTypeSchema,
  expectedAmount: z.number(),
  expectedDate: z.string(),
  receivedAmount: z.number(),
  receivedAt: z.string().nullable().optional(),
  isRecurring: z.boolean(),
  status: IncomeStatusSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateIncomePayloadSchema = z.object({
  title: z.string().min(1),
  idCategory: z.string().min(1),
  description: z.string().optional(),
  incomeType: IncomeTypeSchema,
  expectedAmount: z.number().positive(),
  expectedDate: z.string().min(1),
  isRecurring: z.boolean().optional(),
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
  expectedAmount: z.number().positive().optional(),
  expectedDate: z.string().optional(),
  receivedAmount: z.number().min(0).optional(),
  receivedAt: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

export interface IncomeListQueryParams extends ListQueryParams {
  status?: IncomeStatus;
  incomeType?: IncomeType;
  idCategory?: string;
  expectedDateFrom?: string;
  expectedDateTo?: string;
}

export type IncomeType = z.infer<typeof IncomeTypeSchema>;
export type IncomeStatus = z.infer<typeof IncomeStatusSchema>;
export type Income = z.infer<typeof IncomeSchema>;
export type CreateIncomePayload = z.infer<typeof CreateIncomePayloadSchema>;
export type UpdateIncomeStatusPayload = z.infer<
  typeof UpdateIncomeStatusPayloadSchema
>;
export type UpdateIncomeDetailsPayload = z.infer<
  typeof UpdateIncomeDetailsPayloadSchema
>;
export type IncomesResponse = PaginatedResponse<Income>;
