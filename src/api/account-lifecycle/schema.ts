import { z } from "zod";

export const AccountDeactivationReasonSchema = z.enum([
  "NOT_USING_ANYMORE",
  "TAKING_A_BREAK",
  "TOO_MANY_NOTIFICATIONS",
  "FOUND_ALTERNATIVE",
  "HARD_TO_USE",
  "OTHER",
]);

export const AccountDeletionReasonSchema = z.enum([
  "NOT_USING_ANYMORE",
  "PRIVACY_CONCERNS",
  "FOUND_ALTERNATIVE",
  "HARD_TO_USE",
  "TECHNICAL_ISSUES",
  "OTHER",
]);

export const AccountLifecycleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const DeactivateAccountPayloadSchema = z.object({
  reasons: z.array(AccountDeactivationReasonSchema),
  otherReason: z.string().optional(),
});

export const RequestAccountDeletionPayloadSchema = z.object({
  reasons: z.array(AccountDeletionReasonSchema),
  otherReason: z.string().optional(),
});

export type AccountDeactivationReason = z.infer<
  typeof AccountDeactivationReasonSchema
>;
export type AccountDeletionReason = z.infer<typeof AccountDeletionReasonSchema>;
export type AccountLifecycleResponse = z.infer<
  typeof AccountLifecycleResponseSchema
>;
export type DeactivateAccountPayload = z.infer<
  typeof DeactivateAccountPayloadSchema
>;
export type RequestAccountDeletionPayload = z.infer<
  typeof RequestAccountDeletionPayloadSchema
>;
