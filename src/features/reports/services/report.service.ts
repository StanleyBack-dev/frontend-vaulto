import { getCategoryComparison } from "@/api/reports/methods/get-category-comparison";
import { getDebtsReport } from "@/api/reports/methods/get-debts-report";
import { getFinancialForecast } from "@/api/reports/methods/get-financial-forecast";
import {
  CategoryComparisonSchema,
  DebtsReportSchema,
  FinancialForecastSchema,
  type CategoryComparison,
  type CategoryComparisonQueryParams,
  type DebtsReport,
  type DebtsReportQueryParams,
  type FinancialForecast,
  type FinancialForecastPayload,
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
