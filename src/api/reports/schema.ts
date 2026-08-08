import { z } from "zod";

export const DebtsReportStatusCountsSchema = z.object({
  open: z.number(),
  overdue: z.number(),
  partiallyPaid: z.number(),
  paid: z.number(),
});

export const DebtsReportSchema = z.object({
  totalAmountDue: z.number(),
  totalAmountPaid: z.number(),
  totalOutstanding: z.number(),
  totalCount: z.number(),
  countByStatus: DebtsReportStatusCountsSchema,
});

export type DebtsReportStatusCounts = z.infer<
  typeof DebtsReportStatusCountsSchema
>;
export type DebtsReport = z.infer<typeof DebtsReportSchema>;

export interface DebtsReportQueryParams {
  dueDateFrom?: string;
  dueDateTo?: string;
  debtType?: string;
  idCategory?: string;
}

export const FinancialForecastSchema = z.object({
  currentBalance: z.number(),
  projectedIncome: z.number(),
  projectedExpenses: z.number(),
  safeToSpend: z.number(),
  periodStart: z.string(),
  periodEnd: z.string(),
});

export type FinancialForecast = z.infer<typeof FinancialForecastSchema>;

export interface FinancialForecastPayload {
  currentBalance: number;
  periodStart?: string;
  periodEnd?: string;
}
