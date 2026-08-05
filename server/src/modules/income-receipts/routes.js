import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import {
  deleteIncomeReceipt,
  getIncomeReceipts,
  registerInstallmentReceipt,
  updateIncomeReceipt,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.post("/installments/:idIncomeInstallment", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const result = await registerInstallmentReceipt(
      {
        idIncome: req.body?.idIncome,
        idIncomeInstallment: req.params.idIncomeInstallment,
        amountReceived: req.body?.amountReceived,
        receivedAt: req.body?.receivedAt,
      },
      authContext,
      req.requestId,
    );
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/incomes/:idIncome", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const receipts = await getIncomeReceipts(
      req.params.idIncome,
      authContext,
      req.requestId,
    );
    res.json(receipts);
  } catch (error) {
    sendError(res, error);
  }
});

router.patch("/:idIncomeReceipt", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const result = await updateIncomeReceipt(
      {
        idIncomeReceipt: req.params.idIncomeReceipt,
        amountReceived: req.body?.amountReceived,
        receivedAt: req.body?.receivedAt,
      },
      authContext,
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.delete("/:idIncomeReceipt", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const result = await deleteIncomeReceipt(
      req.params.idIncomeReceipt,
      authContext,
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
