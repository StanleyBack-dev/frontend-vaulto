import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { HttpError } from "../../shared/http/http-error.js";
import { exportResource } from "./service.js";

const router = Router();

const FORMAT_BY_QUERY_VALUE = {
  pdf: "PDF",
  xlsx: "XLSX",
};

function resolveFormat(query) {
  const format =
    FORMAT_BY_QUERY_VALUE[String(query.format || "").toLowerCase()];
  if (!format) {
    throw new HttpError(400, "Informe format=pdf ou format=xlsx.");
  }
  return format;
}

function stringOrUndefined(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function booleanOrUndefined(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function handleExport(resource, buildFilters) {
  return async (req, res) => {
    try {
      const authContext = getAuthContext(req);
      const input = {
        resource,
        format: resolveFormat(req.query),
        ...buildFilters(req.query),
      };

      const result = await exportResource(input, authContext, req.requestId);
      const buffer = Buffer.from(result.base64, "base64");

      res.setHeader("Content-Type", result.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`,
      );
      res.send(buffer);
    } catch (error) {
      const { statusCode, body } = buildErrorResponse(error);
      res.status(statusCode).json(body);
    }
  };
}

function periodFilters(query) {
  return {
    dueDateFrom: stringOrUndefined(query.dueDateFrom),
    dueDateTo: stringOrUndefined(query.dueDateTo),
  };
}

router.get(
  "/debts",
  handleExport("DEBTS", (query) => ({
    ...periodFilters(query),
    debtStatus: stringOrUndefined(query.debtStatus),
    debtType: stringOrUndefined(query.debtType),
    idCategory: stringOrUndefined(query.idCategory),
  })),
);

router.get(
  "/payments",
  handleExport("PAYMENTS", (query) => ({
    idDebt: stringOrUndefined(query.idDebt),
  })),
);

router.get(
  "/incomes",
  handleExport("INCOMES", (query) => ({
    ...periodFilters(query),
    incomeStatus: stringOrUndefined(query.incomeStatus),
    incomeType: stringOrUndefined(query.incomeType),
    idCategory: stringOrUndefined(query.idCategory),
  })),
);

router.get(
  "/income-receipts",
  handleExport("INCOME_RECEIPTS", (query) => ({
    idIncome: stringOrUndefined(query.idIncome),
  })),
);

router.get(
  "/credit-cards",
  handleExport("CREDIT_CARDS", (query) => ({
    activeOnly: booleanOrUndefined(query.activeOnly),
  })),
);

router.get(
  "/categories",
  handleExport("CATEGORIES", (query) => ({
    activeOnly: booleanOrUndefined(query.activeOnly),
    categoryType: stringOrUndefined(query.categoryType),
  })),
);

router.get(
  "/statement",
  handleExport("STATEMENT", (query) => ({
    ...periodFilters(query),
    statementScope: stringOrUndefined(query.statementScope),
  })),
);

router.get(
  "/goals",
  handleExport("GOALS", () => ({})),
);

router.get(
  "/goal-contributions",
  handleExport("GOAL_CONTRIBUTIONS", (query) => ({
    idFinancialGoal: stringOrUndefined(query.idFinancialGoal),
  })),
);

export default router;
