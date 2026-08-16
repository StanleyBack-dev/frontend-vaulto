import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { buildListInput } from "../../shared/http/parse-pagination.js";
import {
  finalizeSupportTicket,
  getMySupportMessageStatus,
  getSupportTicket,
  listSupportTickets,
  replyToSupportTicket,
  sendSupportMessage,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.get("/status", async (req, res) => {
  try {
    const result = await getMySupportMessageStatus(
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/tickets", async (req, res) => {
  try {
    const input = buildListInput(req.query, ["status", "category"]);
    const result = await listSupportTickets(
      input,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/tickets/:idSupportMessage", async (req, res) => {
  try {
    const result = await getSupportTicket(
      req.params.idSupportMessage,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/tickets/:idSupportMessage/reply", async (req, res) => {
  try {
    const result = await replyToSupportTicket(
      { idSupportMessage: req.params.idSupportMessage, reply: req.body.reply },
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/tickets/:idSupportMessage/finalize", async (req, res) => {
  try {
    const result = await finalizeSupportTicket(
      req.params.idSupportMessage,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await sendSupportMessage(
      req.body,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
