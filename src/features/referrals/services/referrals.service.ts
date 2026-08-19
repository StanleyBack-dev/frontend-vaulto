import { getMyReferralStats } from "@/api/referrals/methods/get-stats";
import { getMyReferralWithdrawals } from "@/api/referrals/methods/get-withdrawals";
import { lookupReferralWithdrawalPixKey } from "@/api/referrals/methods/lookup-pix-key";
import { requestReferralWithdrawal } from "@/api/referrals/methods/request-withdrawal";
import {
  PixKeyLookupSchema,
  ReferralStatsSchema,
  ReferralWithdrawalSchema,
  type PixKeyLookup,
  type ReferralStats,
  type ReferralWithdrawal,
  type RequestReferralWithdrawalPayload,
} from "@/api/referrals/schema";

export async function fetchMyReferralStats(): Promise<ReferralStats> {
  const response = await getMyReferralStats();
  const parsed = ReferralStatsSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar os dados de indicação.");
  }

  return parsed.data;
}

export async function fetchMyReferralWithdrawals(): Promise<
  ReferralWithdrawal[]
> {
  const response = await getMyReferralWithdrawals();
  const parsed = ReferralWithdrawalSchema.array().safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o histórico de saques.");
  }

  return parsed.data;
}

export async function lookupMyReferralWithdrawalPixKey(
  payload: RequestReferralWithdrawalPayload,
): Promise<PixKeyLookup> {
  const response = await lookupReferralWithdrawalPixKey(payload);
  const parsed = PixKeyLookupSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar a resposta da consulta.");
  }

  return parsed.data;
}

export async function requestMyReferralWithdrawal(
  payload: RequestReferralWithdrawalPayload,
): Promise<ReferralWithdrawal> {
  const response = await requestReferralWithdrawal(payload);
  const parsed = ReferralWithdrawalSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar a resposta do saque.");
  }

  return parsed.data;
}
