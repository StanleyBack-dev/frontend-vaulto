import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { DebtListQueryParams, DebtsResponse } from "../schema";

/**
 * Lightweight debt listing meant to feed pickers/dropdowns (e.g. the Payments
 * page debt select). Kept separate from `getMyDebts` so callers can request the
 * full set of debts without disturbing the paginated listing state.
 */
export async function getMyDebtOptions(
  params: DebtListQueryParams = {},
): Promise<DebtsResponse> {
  try {
    const response = await apiHttp.get<DebtsResponse>("/debts", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível listar dívidas."),
    );
  }
}
