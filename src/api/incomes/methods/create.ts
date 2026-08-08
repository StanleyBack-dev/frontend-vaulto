import {
  apiHttp,
  getApiErrorCode,
  getApiErrorMessage,
} from "../../shared/http-client";
import {
  PLAN_LIMIT_REACHED_CODE,
  PlanLimitReachedError,
} from "../../shared/plan-limit-error";
import type { CreateIncomePayload, Income } from "../schema";

export async function createIncome(
  payload: CreateIncomePayload,
): Promise<Income> {
  try {
    const response = await apiHttp.post<Income>("/incomes", payload);
    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      "Não foi possível criar a receita.",
    );

    if (getApiErrorCode(error) === PLAN_LIMIT_REACHED_CODE) {
      throw new PlanLimitReachedError(message);
    }

    throw new Error(message);
  }
}
