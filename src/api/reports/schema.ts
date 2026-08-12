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

export const CategoryComparisonEntrySchema = z.object({
  idCategory: z.string(),
  categoryName: z.string(),
  currentAmount: z.number(),
  previousAmount: z.number(),
  changeAmount: z.number(),
  changePercent: z.number().nullable(),
});

export const CategoryComparisonGroupSchema = z.object({
  currentTotal: z.number(),
  previousTotal: z.number(),
  changeAmount: z.number(),
  changePercent: z.number().nullable(),
  categories: z.array(CategoryComparisonEntrySchema),
});

export const CategoryComparisonSchema = z.object({
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  previousPeriodStart: z.string(),
  previousPeriodEnd: z.string(),
  expenses: CategoryComparisonGroupSchema,
  income: CategoryComparisonGroupSchema,
});

export type CategoryComparisonEntry = z.infer<
  typeof CategoryComparisonEntrySchema
>;
export type CategoryComparisonGroup = z.infer<
  typeof CategoryComparisonGroupSchema
>;
export type CategoryComparison = z.infer<typeof CategoryComparisonSchema>;

export type CategoryComparisonPeriodType =
  | "MONTH"
  | "QUARTER"
  | "SEMESTER"
  | "YEAR";

export interface CategoryComparisonQueryParams {
  periodType?: CategoryComparisonPeriodType;
  referenceDate?: string;
  comparisonDate?: string;
}

export const FinancialHealthPillarScoreSchema = z.object({
  score: z.number(),
  weight: z.number(),
});

export const FinancialHealthScoreSchema = z.object({
  score: z.number(),
  status: z.enum(["HEALTHY", "ATTENTION", "CRITICAL"]),
  debtCommitment: FinancialHealthPillarScoreSchema,
  punctuality: FinancialHealthPillarScoreSchema,
  reserves: FinancialHealthPillarScoreSchema.nullable(),
  periodStart: z.string(),
  periodEnd: z.string(),
});

export type FinancialHealthPillarScore = z.infer<
  typeof FinancialHealthPillarScoreSchema
>;
export type FinancialHealthScore = z.infer<typeof FinancialHealthScoreSchema>;
export type FinancialHealthStatus = FinancialHealthScore["status"];

export interface FinancialHealthScoreQueryParams {
  periodEnd?: string;
}
