import { getAdminDashboardStats } from "../../../api/admin/methods/getAdminDashboardStats";
import {
  AdminDashboardStatsSchema,
  type AdminDashboardStats,
} from "../../../api/admin/schema";

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await getAdminDashboardStats();
  const parsed = AdminDashboardStatsSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar as estatísticas do painel.");
  }

  return parsed.data;
}
