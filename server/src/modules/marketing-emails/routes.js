import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { buildListInput } from "../../shared/http/parse-pagination.js";
import {
  exportMarketingEmailSends,
  getMarketingEmailDefaultTemplate,
  getMarketingEmailRecipientCooldown,
  listMarketingEmailSends,
  previewMarketingEmail,
  sendMarketingEmail,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.get("/default-template", async (req, res) => {
  try {
    const result = await getMarketingEmailDefaultTemplate(
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/preview", async (req, res) => {
  try {
    const result = await previewMarketingEmail(
      {
        subject: req.body.subject,
        bodyMarkdown: req.body.bodyMarkdown,
        recipientName: req.body.recipientName,
        partnershipPercentage: req.body.partnershipPercentage,
      },
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/cooldown", async (req, res) => {
  try {
    const result = await getMarketingEmailRecipientCooldown(
      req.query.email,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/sends", async (req, res) => {
  try {
    const input = buildListInput(req.query, ["category", "recipientEmail"]);
    const result = await listMarketingEmailSends(
      input,
      getAuthContext(req),
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/sends/export", async (req, res) => {
  try {
    const input = buildListInput(req.query, ["category", "recipientEmail"]);
    const result = await exportMarketingEmailSends(
      input,
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
    const result = await sendMarketingEmail(
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
