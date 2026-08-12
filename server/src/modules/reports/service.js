import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  GET_CATEGORY_COMPARISON_QUERY,
  GET_DEBTS_REPORT_QUERY,
  GET_FINANCIAL_FORECAST_QUERY,
  GET_FINANCIAL_HEALTH_SCORE_QUERY,
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
