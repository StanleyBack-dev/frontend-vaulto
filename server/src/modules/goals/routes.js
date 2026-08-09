import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { buildListInput } from "../../shared/http/parse-pagination.js";
import {
  createFinancialGoal,
  deleteFinancialGoal,
  deleteGoalContribution,
  getFinancialGoalById,
  listFinancialGoals,
  registerGoalContribution,
  updateFinancialGoal,
  updateGoalContribution,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.get("/", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const input = buildListInput(req.query, []);
    const goals = await listFinancialGoals(input, authContext, req.requestId);
    res.json(goals);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/:idFinancialGoal", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const goal = await getFinancialGoalById(
      req.params.idFinancialGoal,
      authContext,
      req.requestId,
    );
    res.json(goal);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const goal = await createFinancialGoal(
      req.body,
      authContext,
      req.requestId,
    );
    res.status(201).json(goal);
  } catch (error) {
    sendError(res, error);
  }
});

router.patch("/:idFinancialGoal", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const goal = await updateFinancialGoal(
      {
        idFinancialGoal: req.params.idFinancialGoal,
        title: req.body?.title,
        description: req.body?.description,
        targetAmount: req.body?.targetAmount,
        targetDate: req.body?.targetDate,
      },
      authContext,
      req.requestId,
    );
    res.json(goal);
  } catch (error) {
    sendError(res, error);
  }
});

router.delete("/:idFinancialGoal", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const result = await deleteFinancialGoal(
      req.params.idFinancialGoal,
      authContext,
      req.requestId,
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/:idFinancialGoal/contributions", async (req, res) => {
  try {
    const authContext = getAuthContext(req);
    const goal = await registerGoalContribution(
      {
        idFinancialGoal: req.params.idFinancialGoal,
        amount: req.body?.amount,
        contributedAt: req.body?.contributedAt,
        note: req.body?.note,
      },
      authContext,
      req.requestId,
    );
    res.status(201).json(goal);
  } catch (error) {
    sendError(res, error);
  }
});

router.patch(
  "/:idFinancialGoal/contributions/:idGoalContribution",
  async (req, res) => {
    try {
      const authContext = getAuthContext(req);
      const goal = await updateGoalContribution(
        {
          idFinancialGoal: req.params.idFinancialGoal,
          idGoalContribution: req.params.idGoalContribution,
          amount: req.body?.amount,
          contributedAt: req.body?.contributedAt,
          note: req.body?.note,
        },
        authContext,
        req.requestId,
      );
      res.json(goal);
    } catch (error) {
      sendError(res, error);
    }
  },
);

router.delete(
  "/:idFinancialGoal/contributions/:idGoalContribution",
  async (req, res) => {
    try {
      const authContext = getAuthContext(req);
      const goal = await deleteGoalContribution(
        req.params.idFinancialGoal,
        req.params.idGoalContribution,
        authContext,
        req.requestId,
      );
      res.json(goal);
    } catch (error) {
      sendError(res, error);
    }
  },
);

export default router;
