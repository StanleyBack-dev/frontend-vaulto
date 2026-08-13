import { z } from "zod";

export const SupportCategorySchema = z.enum([
  "DOUBT",
  "TECHNICAL_ISSUE",
  "SUGGESTION",
  "BILLING",
  "OTHER",
]);

export const SendSupportMessagePayloadSchema = z.object({
  category: SupportCategorySchema,
  message: z.string().min(1),
});

export const SupportMessageSchema = z.object({
  category: SupportCategorySchema,
  message: z.string(),
  createdAt: z.string(),
});

export const SupportMessageStatusSchema = z.object({
  canSend: z.boolean(),
  nextAllowedAt: z.string().nullable().optional(),
});

export type SupportCategory = z.infer<typeof SupportCategorySchema>;
export type SendSupportMessagePayload = z.infer<
  typeof SendSupportMessagePayloadSchema
>;
export type SupportMessage = z.infer<typeof SupportMessageSchema>;
export type SupportMessageStatus = z.infer<typeof SupportMessageStatusSchema>;
