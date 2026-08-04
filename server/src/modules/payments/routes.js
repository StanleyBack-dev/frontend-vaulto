import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import {
  deleteDebtPayment,
  getDebtPayments,
  registerInstallmentPayment,
  updateDebtPayment,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.post("/installments/:idDebtInstallment", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const result = await registerInstallmentPayment(
      {
        idDebt: req.body?.idDebt,
        idDebtInstallment: req.params.idDebtInstallment,
        amountPaid: req.body?.amountPaid,
        paidAt: req.body?.paidAt,
      },
      authContext,
      req.requestId,
    );
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/debts/:idDebt", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const payments = await getDebtPayments(
      req.params.idDebt,
      authContext,
      req.requestId,
    );
    res.json(payments);
  } catch (error) {
    sendError(res, error);
  }
});

router.patch("/:idDebtPayment", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const result = await updateDebtPayment(
      {
        idDebtPayment: req.params.idDebtPayment,
        amountPaid: req.body?.amountPaid,
        paidAt: req.body?.paidAt,
      },
      authContext,
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.delete("/:idDebtPayment", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const result = await deleteDebtPayment(
      req.params.idDebtPayment,
      authContext,
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
