import { z } from "zod";

export const ReferralRewardStatusSchema = z.enum(["PENDING", "APPLIED"]);

export const ReferralStatsSchema = z.object({
  referralCode: z.string(),
  qualifiedReferralsCount: z.number(),
  thresholdCount: z.number(),
  rewardStatus: ReferralRewardStatusSchema.nullable().optional(),
});

export type ReferralRewardStatus = z.infer<typeof ReferralRewardStatusSchema>;
export type ReferralStats = z.infer<typeof ReferralStatsSchema>;
