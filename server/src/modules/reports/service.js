import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  GET_CATEGORY_COMPARISON_QUERY,
  GET_DEBTS_AMOUNT_BY_CATEGORY_QUERY,
  GET_DEBTS_REPORT_QUERY,
  GET_FINANCIAL_FORECAST_QUERY,
  GET_FINANCIAL_HEALTH_SCORE_QUERY,
  GET_INCOMES_AMOUNT_BY_CATEGORY_QUERY,
  GET_INCOMES_REPORT_QUERY,
  GET_MONTHLY_CASHFLOW_TREND_QUERY,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function getDebtsReport(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_DEBTS_REPORT_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(data.getDebtsReport, "Invalid debts report response.");
}

export async function getIncomesReport(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_INCOMES_REPORT_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(data.getIncomesReport, "Invalid incomes report response.");
}

export async function getDebtsAmountByCategory(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_DEBTS_AMOUNT_BY_CATEGORY_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.getDebtsAmountByCategory,
    "Invalid debts by category response.",
  );
}

export async function getIncomesAmountByCategory(
  input,
  authContext,
  requestId,
) {
  const data = await executeGraphql({
    query: GET_INCOMES_AMOUNT_BY_CATEGORY_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.getIncomesAmountByCategory,
    "Invalid incomes by category response.",
  );
}

export async function getMonthlyCashflowTrend(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_MONTHLY_CASHFLOW_TREND_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.getMonthlyCashflowTrend,
    "Invalid monthly cashflow trend response.",
  );
}

export async function getFinancialForecast(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_FINANCIAL_FORECAST_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.getFinancialForecast,
    "Invalid financial forecast response.",
  );
}

export async function getCategoryComparison(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_CATEGORY_COMPARISON_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.getCategoryComparison,
    "Invalid category comparison response.",
  );
}

export async function getFinancialHealthScore(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_FINANCIAL_HEALTH_SCORE_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.getFinancialHealthScore,
    "Invalid financial health score response.",
  );
}
