import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { getMyReferralStats } from "./service.js";

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

export default router;
