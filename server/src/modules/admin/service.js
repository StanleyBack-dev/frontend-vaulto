import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import { ADMIN_DASHBOARD_STATS_QUERY } from "./queries.js";

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
