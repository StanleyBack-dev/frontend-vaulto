import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { buildListInput } from "../../shared/http/parse-pagination.js";
import {
  getAdminDashboardStats,
  getAdminReferralLeaderboard,
  getAdminReferralStats,
  getAdminReferralTrend,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.get("/stats", async (req, res) => {
  try {
    const result = await getAdminDashboardStats(
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/referrals/stats", async (req, res) => {
  try {
    const result = await getAdminReferralStats(
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/referrals/trend", async (req, res) => {
  try {
    const input = buildListInput(req.query, ["dateFrom", "dateTo"]);
    const result = await getAdminReferralTrend(
      input,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/referrals/leaderboard", async (req, res) => {
  try {
    const result = await getAdminReferralLeaderboard(
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
