import { getCategoryComparison } from "@/api/reports/methods/get-category-comparison";
import { getDebtsAmountByCategory } from "@/api/reports/methods/get-debts-amount-by-category";
import { getDebtsReport } from "@/api/reports/methods/get-debts-report";
import { getFinancialForecast } from "@/api/reports/methods/get-financial-forecast";
import { getFinancialHealthScore } from "@/api/reports/methods/get-financial-health-score";
import { getIncomesAmountByCategory } from "@/api/reports/methods/get-incomes-amount-by-category";
import { getIncomesReport } from "@/api/reports/methods/get-incomes-report";
import { getMonthlyCashflowTrend } from "@/api/reports/methods/get-monthly-cashflow-trend";
import {
  CategoryAmountRowSchema,
  CategoryComparisonSchema,
  DebtsReportSchema,
  FinancialForecastSchema,
  FinancialHealthScoreSchema,
  IncomesReportSchema,
  MonthlyCashflowPointSchema,
  type CategoryAmountQueryParams,
  type CategoryAmountRow,
  type CategoryComparison,
  type CategoryComparisonQueryParams,
  type DebtsReport,
  type DebtsReportQueryParams,
  type FinancialForecast,
  type FinancialForecastPayload,
  type FinancialHealthScore,
  type FinancialHealthScoreQueryParams,
  type IncomesReport,
  type IncomesReportQueryParams,
  type MonthlyCashflowPoint,
} from "@/api/reports/schema";
import { reportUiCopy } from "../model/messages";

export async function fetchDebtsReport(
  params: DebtsReportQueryParams = {},
): Promise<DebtsReport> {
  const response = await getDebtsReport(params);
  const parsed = DebtsReportSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(reportUiCopy.errors.invalidResponseData);
  }

  return parsed.data;
}

export async function fetchIncomesReport(
  params: IncomesReportQueryParams = {},
): Promise<IncomesReport> {
  const response = await getIncomesReport(params);
  const parsed = IncomesReportSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(reportUiCopy.errors.invalidResponseData);
  }

  return parsed.data;
}

export async function fetchDebtsAmountByCategory(
  params: CategoryAmountQueryParams,
): Promise<CategoryAmountRow[]> {
  const response = await getDebtsAmountByCategory(params);
  const parsed = CategoryAmountRowSchema.array().safeParse(response);

  if (!parsed.success) {
    throw new Error(reportUiCopy.errors.invalidResponseData);
  }

  return parsed.data;
}

export async function fetchIncomesAmountByCategory(
  params: CategoryAmountQueryParams,
): Promise<CategoryAmountRow[]> {
  const response = await getIncomesAmountByCategory(params);
  const parsed = CategoryAmountRowSchema.array().safeParse(response);

  if (!parsed.success) {
    throw new Error(reportUiCopy.errors.invalidResponseData);
  }

  return parsed.data;
}

export async function fetchMonthlyCashflowTrend(
  params: CategoryAmountQueryParams,
): Promise<MonthlyCashflowPoint[]> {
  const response = await getMonthlyCashflowTrend(params);
  const parsed = MonthlyCashflowPointSchema.array().safeParse(response);

  if (!parsed.success) {
    throw new Error(reportUiCopy.errors.invalidResponseData);
  }

  return parsed.data;
}

export async function fetchFinancialForecast(
  payload: FinancialForecastPayload,
): Promise<FinancialForecast> {
  const response = await getFinancialForecast(payload);
  const parsed = FinancialForecastSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(reportUiCopy.errors.invalidResponseData);
  }

  return parsed.data;
}

export async function fetchCategoryComparison(
  params: CategoryComparisonQueryParams = {},
): Promise<CategoryComparison> {
  const response = await getCategoryComparison(params);
  const parsed = CategoryComparisonSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(reportUiCopy.errors.invalidResponseData);
  }

  return parsed.data;
}

export async function fetchFinancialHealthScore(
  params: FinancialHealthScoreQueryParams = {},
): Promise<FinancialHealthScore> {
  const response = await getFinancialHealthScore(params);
  const parsed = FinancialHealthScoreSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(reportUiCopy.errors.invalidResponseData);
  }

  return parsed.data;
}
