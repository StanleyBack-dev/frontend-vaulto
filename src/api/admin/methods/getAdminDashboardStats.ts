import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { AdminDashboardStats } from "../schema";

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  try {
    const response = await apiHttp.get<AdminDashboardStats>("/admin/stats");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar as estatísticas do painel.",
      ),
    );
  }
}
