import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  LOOKUP_REFERRAL_WITHDRAWAL_PIX_KEY_QUERY,
  MY_REFERRAL_STATS_QUERY,
  MY_REFERRAL_WITHDRAWALS_QUERY,
  MY_REFERRALS_QUERY,
  REQUEST_REFERRAL_WITHDRAWAL_MUTATION,
  SEND_REFERRAL_INVITE_MUTATION,
} from "./queries.js";

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

export async function getMyReferralWithdrawals(authContext, requestId) {
  const data = await executeGraphql({
    query: MY_REFERRAL_WITHDRAWALS_QUERY,
    requestId,
    ...authContext,
  });

  return requireData(
    data.myReferralWithdrawals,
    "Invalid referral withdrawals response.",
  );
}

export async function lookupReferralWithdrawalPixKey(
  input,
  authContext,
  requestId,
) {
  const data = await executeGraphql({
    query: LOOKUP_REFERRAL_WITHDRAWAL_PIX_KEY_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.lookupReferralWithdrawalPixKey,
    "Invalid pix key lookup response.",
  );
}

export async function requestReferralWithdrawal(input, authContext, requestId) {
  const data = await executeGraphql({
    query: REQUEST_REFERRAL_WITHDRAWAL_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.requestReferralWithdrawal,
    "Invalid withdrawal response.",
  );
}

export async function getMyReferrals(authContext, requestId) {
  const data = await executeGraphql({
    query: MY_REFERRALS_QUERY,
    requestId,
    ...authContext,
  });

  return requireData(data.myReferrals, "Invalid referrals response.");
}

export async function sendReferralInvite(input, authContext, requestId) {
  const data = await executeGraphql({
    query: SEND_REFERRAL_INVITE_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return Boolean(data.sendReferralInvite);
}
