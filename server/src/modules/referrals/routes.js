import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import {
  getMyReferralStats,
  getMyReferralWithdrawals,
  lookupReferralWithdrawalPixKey,
  requestReferralWithdrawal,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.get("/stats", async (req, res) => {
  try {
    const stats = await getMyReferralStats(getAuthContext(req), req.requestId);
    res.json(stats);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/withdrawals", async (req, res) => {
  try {
    const withdrawals = await getMyReferralWithdrawals(
      getAuthContext(req),
      req.requestId,
    );
    res.json(withdrawals);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/withdrawals/lookup-pix-key", async (req, res) => {
  try {
    const lookup = await lookupReferralWithdrawalPixKey(
      req.body,
      getAuthContext(req),
      req.requestId,
    );
    res.json(lookup);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/withdrawals", async (req, res) => {
  try {
    const withdrawal = await requestReferralWithdrawal(
      req.body,
      getAuthContext(req),
      req.requestId,
    );
    res.status(201).json(withdrawal);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
