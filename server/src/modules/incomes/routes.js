import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { buildListInput } from "../../shared/http/parse-pagination.js";
import {
  createIncome,
  deleteIncome,
  getIncomeById,
  listIncomes,
  updateIncomeDetails,
  updateIncomeStatus,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.get("/", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const input = buildListInput(req.query, [
      "status",
      "incomeType",
      "idCategory",
      "expectedDateFrom",
      "expectedDateTo",
    ]);
    const incomes = await listIncomes(input, authContext, req.requestId);
    res.json(incomes);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/:idIncome", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const income = await getIncomeById(
      req.params.idIncome,
      authContext,
      req.requestId,
    );
    res.json(income);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const income = await createIncome(req.body, authContext, req.requestId);
    res.status(201).json(income);
  } catch (error) {
    sendError(res, error);
  }
});

router.patch("/:idIncome/details", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const income = await updateIncomeDetails(
      {
        idIncome: req.params.idIncome,
        title: req.body?.title,
        description: req.body?.description,
        idCategory: req.body?.idCategory,
        incomeType: req.body?.incomeType,
        expectedAmount: req.body?.expectedAmount,
        expectedDate: req.body?.expectedDate,
        receivedAmount: req.body?.receivedAmount,
        receivedAt: req.body?.receivedAt,
        isRecurring: req.body?.isRecurring,
      },
      authContext,
      req.requestId,
    );
    res.json(income);
  } catch (error) {
    sendError(res, error);
  }
});

router.patch("/:idIncome/status", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const income = await updateIncomeStatus(
      {
        idIncome: req.params.idIncome,
        status: req.body?.status,
      },
      authContext,
      req.requestId,
    );
    res.json(income);
  } catch (error) {
    sendError(res, error);
  }
});

router.delete("/:idIncome", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const result = await deleteIncome(
      req.params.idIncome,
      authContext,
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
