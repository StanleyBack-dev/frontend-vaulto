import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { buildListInput } from "../../shared/http/parse-pagination.js";
import {
  cancelSubscription,
  getMyBillingPayments,
  getMySubscription,
  subscribeToPro,
  trackProLeadClick,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.get("/", async (req, res) => {
  try {
    const subscription = await getMySubscription(
      getAuthContext(req),
      req.requestId,
    );
    res.json(subscription);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/subscribe", async (req, res) => {
  try {
    const result = await subscribeToPro(
      req.body,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/track-lead-click", async (req, res) => {
  try {
    const result = await trackProLeadClick(getAuthContext(req), req.requestId);
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/cancel", async (req, res) => {
  try {
    const result = await cancelSubscription(
      req.body,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/payments", async (req, res) => {
  try {
    const input = buildListInput(req.query);
    const result = await getMyBillingPayments(
      input,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
