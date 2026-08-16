import {
  apiHttp,
  getApiErrorCode,
  getApiErrorMessage,
} from "../../shared/http-client";
import {
  PLAN_LIMIT_REACHED_CODE,
  PlanLimitReachedError,
} from "../../shared/plan-limit-error";
import type { CreateDebtPayload, Debt } from "../schema";

export async function createDebt(payload: CreateDebtPayload): Promise<Debt> {
  try {
    const response = await apiHttp.post<Debt>("/debts", payload);
    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      "Não foi possível criar a dívida.",
    );

    if (getApiErrorCode(error) === PLAN_LIMIT_REACHED_CODE) {
      throw new PlanLimitReachedError(message);
    }

    throw new Error(message);
  }
}
