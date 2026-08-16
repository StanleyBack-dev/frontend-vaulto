import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { buildListInput } from "../../shared/http/parse-pagination.js";
import {
  getCategoryComparison,
  getDebtsAmountByCategory,
  getDebtsReport,
  getFinancialForecast,
  getFinancialHealthScore,
  getIncomesAmountByCategory,
  getIncomesReport,
  getMonthlyCashflowTrend,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.get("/debts", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const input = buildListInput(req.query, [
      "dueDateFrom",
      "dueDateTo",
      "debtType",
      "idCategory",
    ]);
    const report = await getDebtsReport(input, authContext, req.requestId);
    res.json(report);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/incomes", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const input = buildListInput(req.query, [
      "dueDateFrom",
      "dueDateTo",
      "incomeType",
      "idCategory",
    ]);
    const report = await getIncomesReport(input, authContext, req.requestId);
    res.json(report);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/debts-by-category", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const input = buildListInput(req.query, ["dueDateFrom", "dueDateTo"]);
    const rows = await getDebtsAmountByCategory(
      input,
      authContext,
      req.requestId,
    );
    res.json(rows);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/incomes-by-category", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const input = buildListInput(req.query, ["dueDateFrom", "dueDateTo"]);
    const rows = await getIncomesAmountByCategory(
      input,
      authContext,
      req.requestId,
    );
    res.json(rows);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/monthly-cashflow-trend", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const input = buildListInput(req.query, ["dueDateFrom", "dueDateTo"]);
    const points = await getMonthlyCashflowTrend(
      input,
      authContext,
      req.requestId,
    );
    res.json(points);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/forecast", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const forecast = await getFinancialForecast(
      req.body,
      authContext,
      req.requestId,
    );
    res.json(forecast);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/category-comparison", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const input = buildListInput(req.query, [
      "periodType",
      "referenceDate",
      "comparisonDate",
    ]);
    const comparison = await getCategoryComparison(
      input,
      authContext,
      req.requestId,
    );
    res.json(comparison);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/health-score", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const input = buildListInput(req.query, ["periodEnd"]);
    const score = await getFinancialHealthScore(
      input,
      authContext,
      req.requestId,
    );
    res.json(score);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
