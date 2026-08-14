import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import { MY_REFERRAL_STATS_QUERY } from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function getMyReferralStats(authContext, requestId) {
  const data = await executeGraphql({
    query: MY_REFERRAL_STATS_QUERY,
    requestId,
    ...authContext,
  });

  return requireData(data.myReferralStats, "Invalid referral stats response.");
}
