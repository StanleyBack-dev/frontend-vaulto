import { getMyReferralStats } from "@/api/referrals/methods/get-stats";
import {
  ReferralStatsSchema,
  type ReferralStats,
} from "@/api/referrals/schema";

export async function fetchMyReferralStats(): Promise<ReferralStats> {
  const response = await getMyReferralStats();
  const parsed = ReferralStatsSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar os dados de indicação.");
  }

  return parsed.data;
}
