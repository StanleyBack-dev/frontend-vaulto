import { getAdminDashboardStats } from "../../../api/admin/methods/getAdminDashboardStats";
import { getAdminProLeadStats } from "../../../api/admin/methods/getAdminProLeadStats";
import { getAdminProLeads } from "../../../api/admin/methods/getAdminProLeads";
import { getAdminReferralLeaderboard } from "../../../api/admin/methods/getAdminReferralLeaderboard";
import { getAdminReferralStats } from "../../../api/admin/methods/getAdminReferralStats";
import { getAdminReferralTrend } from "../../../api/admin/methods/getAdminReferralTrend";
import type { PaginatedResponse } from "../../../api/shared/contracts";
import {
  AdminDashboardStatsSchema,
  AdminProLeadRowSchema,
  AdminProLeadStatsSchema,
  AdminReferralLeaderboardRowSchema,
  AdminReferralStatsSchema,
  AdminReferralMonthlyPointSchema,
  type AdminDashboardStats,
  type AdminProLeadRow,
  type AdminProLeadsQueryParams,
  type AdminProLeadStats,
  type AdminReferralLeaderboardRow,
  type AdminReferralMonthlyPoint,
  type AdminReferralStats,
  type AdminReferralTrendQueryParams,
} from "../../../api/admin/schema";

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await getAdminDashboardStats();
  const parsed = AdminDashboardStatsSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar as estatísticas do painel.");
  }

  return parsed.data;
}

export async function fetchAdminReferralStats(): Promise<AdminReferralStats> {
  const response = await getAdminReferralStats();
  const parsed = AdminReferralStatsSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(
      "Não foi possível interpretar as estatísticas de indicações.",
    );
  }

  return parsed.data;
}

export async function fetchAdminReferralTrend(
  params: AdminReferralTrendQueryParams,
): Promise<AdminReferralMonthlyPoint[]> {
  const response = await getAdminReferralTrend(params);
  const parsed = AdminReferralMonthlyPointSchema.array().safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar a evolução das indicações.");
  }

  return parsed.data;
}

export async function fetchAdminReferralLeaderboard(): Promise<
  AdminReferralLeaderboardRow[]
> {
  const response = await getAdminReferralLeaderboard();
  const parsed = AdminReferralLeaderboardRowSchema.array().safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o ranking de indicações.");
  }

  return parsed.data;
}

export async function fetchAdminProLeadStats(): Promise<AdminProLeadStats> {
  const response = await getAdminProLeadStats();
  const parsed = AdminProLeadStatsSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar as estatísticas de leads.");
  }

  return parsed.data;
}

export async function fetchAdminProLeads(
  params: AdminProLeadsQueryParams = {},
): Promise<PaginatedResponse<AdminProLeadRow>> {
  const response = await getAdminProLeads(params);
  const parsed = AdminProLeadRowSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar a lista de leads.");
  }

  return {
    items: parsed.data,
    total: response.total,
    currentPage: response.currentPage,
    limit: response.limit,
    totalPages: response.totalPages,
    hasNextPage: response.hasNextPage,
  };
}
