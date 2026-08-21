import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { AdminProLeadStats } from "../schema";

export async function getAdminProLeadStats(): Promise<AdminProLeadStats> {
  try {
    const response = await apiHttp.get<AdminProLeadStats>(
      "/admin/pro-leads/stats",
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar as estatísticas de leads.",
      ),
    );
  }
}
