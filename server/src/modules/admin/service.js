import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  ADMIN_DASHBOARD_STATS_QUERY,
  ADMIN_PRO_LEAD_STATS_QUERY,
  ADMIN_PRO_LEADS_QUERY,
  ADMIN_REFERRAL_LEADERBOARD_QUERY,
  ADMIN_REFERRAL_STATS_QUERY,
  ADMIN_REFERRAL_TREND_QUERY,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function getAdminDashboardStats(authContext, requestId) {
  const data = await executeGraphql({
    query: ADMIN_DASHBOARD_STATS_QUERY,
    requestId,
    ...authContext,
  });

  return requireData(
    data.adminDashboardStats,
    "Invalid admin dashboard stats response.",
  );
}

export async function getAdminReferralStats(authContext, requestId) {
  const data = await executeGraphql({
    query: ADMIN_REFERRAL_STATS_QUERY,
    requestId,
    ...authContext,
  });

  return requireData(
    data.adminReferralStats,
    "Invalid admin referral stats response.",
  );
}

export async function getAdminReferralTrend(input, authContext, requestId) {
  const data = await executeGraphql({
    query: ADMIN_REFERRAL_TREND_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.adminReferralTrend,
    "Invalid admin referral trend response.",
  );
}

export async function getAdminReferralLeaderboard(authContext, requestId) {
  const data = await executeGraphql({
    query: ADMIN_REFERRAL_LEADERBOARD_QUERY,
    requestId,
    ...authContext,
  });

  return requireData(
    data.adminReferralLeaderboard,
    "Invalid admin referral leaderboard response.",
  );
}

export async function getAdminProLeadStats(authContext, requestId) {
  const data = await executeGraphql({
    query: ADMIN_PRO_LEAD_STATS_QUERY,
    requestId,
    ...authContext,
  });

  return requireData(
    data.adminProLeadStats,
    "Invalid admin pro lead stats response.",
  );
}

export async function getAdminProLeads(input, authContext, requestId) {
  const data = await executeGraphql({
    query: ADMIN_PRO_LEADS_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(data.adminProLeads, "Invalid admin pro leads response.");
}
