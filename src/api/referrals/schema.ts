import { z } from "zod";

export const PixKeyTypeSchema = z.enum([
  "CPF",
  "CNPJ",
  "EMAIL",
  "PHONE",
  "EVP",
]);

export const ReferralWithdrawalStatusSchema = z.enum([
  "REQUESTED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const ReferralStatsSchema = z.object({
  referralCode: z.string(),
  qualifiedReferralsCount: z.number(),
  creditAmountCents: z.number(),
  minWithdrawalCents: z.number(),
  creditHoldDays: z.number(),
  availableBalanceCents: z.number(),
  pendingHoldBalanceCents: z.number(),
});

export const ReferralWithdrawalSchema = z.object({
  idReferralWithdrawal: z.string(),
  amountCents: z.number(),
  status: ReferralWithdrawalStatusSchema,
  requestedAt: z.string(),
  processedAt: z.string().nullable().optional(),
});

export const RequestReferralWithdrawalPayloadSchema = z.object({
  pixKey: z.string().min(1, "Informe a chave Pix."),
  pixKeyType: PixKeyTypeSchema,
});

export const PixKeyLookupSchema = z.object({
  bankName: z.string(),
  ownerName: z.string(),
  ownerDocument: z.string(),
});

export type PixKeyType = z.infer<typeof PixKeyTypeSchema>;
export type ReferralWithdrawalStatus = z.infer<
  typeof ReferralWithdrawalStatusSchema
>;
export type ReferralStats = z.infer<typeof ReferralStatsSchema>;
export type ReferralWithdrawal = z.infer<typeof ReferralWithdrawalSchema>;
export type RequestReferralWithdrawalPayload = z.infer<
  typeof RequestReferralWithdrawalPayloadSchema
>;
export type PixKeyLookup = z.infer<typeof PixKeyLookupSchema>;
