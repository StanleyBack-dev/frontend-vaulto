import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { buildListInput } from "../../shared/http/parse-pagination.js";
import {
  createDebt,
  deleteDebt,
  getDebtById,
  listDebts,
  updateDebtDetails,
  updateDebtStatus,
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
      "debtType",
      "idCategory",
      "dueDateFrom",
      "dueDateTo",
    ]);
    const debts = await listDebts(input, authContext, req.requestId);
    res.json(debts);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/:idDebt", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const debt = await getDebtById(
      req.params.idDebt,
      authContext,
      req.requestId,
    );
    res.json(debt);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const debt = await createDebt(req.body, authContext, req.requestId);
    res.status(201).json(debt);
  } catch (error) {
    sendError(res, error);
  }
});

router.patch("/:idDebt/details", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const debt = await updateDebtDetails(
      {
        idDebt: req.params.idDebt,
        title: req.body?.title,
        description: req.body?.description,
        idCategory: req.body?.idCategory,
        debtType: req.body?.debtType,
        acquiredAt: req.body?.acquiredAt,
        dueDate: req.body?.dueDate,
        totalAmount: req.body?.totalAmount,
      },
      authContext,
      req.requestId,
    );
    res.json(debt);
  } catch (error) {
    sendError(res, error);
  }
});

router.patch("/:idDebt/status", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const debt = await updateDebtStatus(
      {
        idDebt: req.params.idDebt,
        status: req.body?.status,
      },
      authContext,
      req.requestId,
    );
    res.json(debt);
  } catch (error) {
    sendError(res, error);
  }
});

router.delete("/:idDebt", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const result = await deleteDebt(
      req.params.idDebt,
      authContext,
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
