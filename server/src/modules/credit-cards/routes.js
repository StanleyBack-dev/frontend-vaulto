import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { buildListInput } from "../../shared/http/parse-pagination.js";
import {
  createCreditCard,
  getCreditCardById,
  listCreditCards,
  updateCreditCard,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.get("/", async (req, res) => {
  try {
    const input = buildListInput(req.query, ["status"]);
    if (typeof input.status === "string") {
      if (input.status === "true") {
        input.status = true;
      } else if (input.status === "false") {
        input.status = false;
      } else {
        delete input.status;
      }
    }

    const creditCards = await listCreditCards(
      input,
      getAuthContext(req),
      req.requestId,
    );
    res.json(creditCards);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/:idCreditCard", async (req, res) => {
  try {
    const creditCard = await getCreditCardById(
      req.params.idCreditCard,
      getAuthContext(req),
      req.requestId,
    );
    res.json(creditCard);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const creditCard = await createCreditCard(
      {
        name: req.body?.name,
        creditLimit: req.body?.creditLimit,
        dueDay: req.body?.dueDay,
        closingDay: req.body?.closingDay,
        status: req.body?.status,
      },
      getAuthContext(req),
      req.requestId,
    );
    res.status(201).json(creditCard);
  } catch (error) {
    sendError(res, error);
  }
});

router.patch("/:idCreditCard", async (req, res) => {
  try {
    const creditCard = await updateCreditCard(
      {
        idCreditCard: req.params.idCreditCard,
        name: req.body?.name,
        creditLimit: req.body?.creditLimit,
        dueDay: req.body?.dueDay,
        closingDay: req.body?.closingDay,
        status: req.body?.status,
      },
      getAuthContext(req),
      req.requestId,
    );
    res.json(creditCard);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
