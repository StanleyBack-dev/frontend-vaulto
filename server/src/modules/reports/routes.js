import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { buildListInput } from "../../shared/http/parse-pagination.js";
import {
  getCategoryComparison,
  getDebtsReport,
  getFinancialForecast,
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

export default router;
