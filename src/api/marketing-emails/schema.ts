import { z } from "zod";

export const MarketingEmailCategorySchema = z.enum([
  "INFLUENCER",
  "BUSINESS_PARTNER",
  "PRESS",
  "OTHER",
]);

export const MarketingEmailDefaultTemplateSchema = z.object({
  subject: z.string(),
  bodyMarkdown: z.string(),
});

export const MarketingEmailPreviewPayloadSchema = z.object({
  subject: z.string(),
  bodyMarkdown: z.string(),
  recipientName: z.string().optional(),
  partnershipPercentage: z.number().optional(),
});

export const MarketingEmailPreviewSchema = z.object({
  html: z.string(),
});

export const MarketingEmailCooldownSchema = z.object({
  blocked: z.boolean(),
  nextAllowedAt: z.string().nullable().optional(),
});

export const MarketingEmailSendSchema = z.object({
  idMarketingEmailSend: z.string(),
  category: MarketingEmailCategorySchema,
  recipientEmail: z.string(),
  recipientName: z.string(),
  recipientPhone: z.string().nullable().optional(),
  subject: z.string(),
  partnershipPercentage: z.number().nullable().optional(),
  sentByAdminName: z.string(),
  createdAt: z.string(),
});

export const MarketingEmailSendsResponseSchema = z.object({
  items: z.array(MarketingEmailSendSchema),
  total: z.number(),
  currentPage: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
});

export const ListMarketingEmailSendsQueryParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  category: MarketingEmailCategorySchema.optional(),
  recipientEmail: z.string().optional(),
});

export const SendMarketingEmailPayloadSchema = z.object({
  category: MarketingEmailCategorySchema,
  recipientEmail: z.string().email(),
  recipientName: z.string().min(1),
  recipientPhone: z.string().optional(),
  subject: z.string().min(1),
  bodyMarkdown: z.string().min(1),
  partnershipPercentage: z.number().optional(),
});

export const MarketingEmailExportSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  base64: z.string(),
});

export type MarketingEmailCategory = z.infer<
  typeof MarketingEmailCategorySchema
>;
export type MarketingEmailDefaultTemplate = z.infer<
  typeof MarketingEmailDefaultTemplateSchema
>;
export type MarketingEmailPreviewPayload = z.infer<
  typeof MarketingEmailPreviewPayloadSchema
>;
export type MarketingEmailPreview = z.infer<typeof MarketingEmailPreviewSchema>;
export type MarketingEmailCooldown = z.infer<
  typeof MarketingEmailCooldownSchema
>;
export type MarketingEmailSend = z.infer<typeof MarketingEmailSendSchema>;
export type MarketingEmailSendsResponse = z.infer<
  typeof MarketingEmailSendsResponseSchema
>;
export type ListMarketingEmailSendsQueryParams = z.infer<
  typeof ListMarketingEmailSendsQueryParamsSchema
>;
export type SendMarketingEmailPayload = z.infer<
  typeof SendMarketingEmailPayloadSchema
>;
export type MarketingEmailExport = z.infer<typeof MarketingEmailExportSchema>;
