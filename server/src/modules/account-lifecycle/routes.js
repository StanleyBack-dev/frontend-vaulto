import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import {
  cancelAccountDeletion,
  deactivateAccount,
  requestAccountDeletion,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.post("/deactivate", async (req, res) => {
  try {
    const result = await deactivateAccount(
      req.body,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/deletion", async (req, res) => {
  try {
    const result = await requestAccountDeletion(
      req.body,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/deletion/cancel", async (req, res) => {
  try {
    const result = await cancelAccountDeletion(
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
