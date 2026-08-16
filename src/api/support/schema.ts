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

export const SupportTicketStatusSchema = z.enum([
  "OPEN",
  "ANSWERED",
  "RESOLVED",
]);

export const SupportTicketSchema = z.object({
  idSupportMessage: z.string(),
  protocolNumber: z.number(),
  userName: z.string(),
  userEmail: z.string(),
  category: SupportCategorySchema,
  message: z.string(),
  status: SupportTicketStatusSchema,
  adminReply: z.string().nullable().optional(),
  repliedAt: z.string().nullable().optional(),
  finalizedAt: z.string().nullable().optional(),
  finalizedByName: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const SupportTicketsResponseSchema = z.object({
  items: z.array(SupportTicketSchema),
  total: z.number(),
  currentPage: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
});

export const ListSupportTicketsQueryParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  status: SupportTicketStatusSchema.optional(),
  category: SupportCategorySchema.optional(),
});

export const ReplyToSupportTicketPayloadSchema = z.object({
  idSupportMessage: z.string(),
  reply: z.string().min(1),
});

export type SupportCategory = z.infer<typeof SupportCategorySchema>;
export type SendSupportMessagePayload = z.infer<
  typeof SendSupportMessagePayloadSchema
>;
export type SupportMessage = z.infer<typeof SupportMessageSchema>;
export type SupportMessageStatus = z.infer<typeof SupportMessageStatusSchema>;
export type SupportTicketStatus = z.infer<typeof SupportTicketStatusSchema>;
export type SupportTicket = z.infer<typeof SupportTicketSchema>;
export type SupportTicketsResponse = z.infer<
  typeof SupportTicketsResponseSchema
>;
export type ListSupportTicketsQueryParams = z.infer<
  typeof ListSupportTicketsQueryParamsSchema
>;
export type ReplyToSupportTicketPayload = z.infer<
  typeof ReplyToSupportTicketPayloadSchema
>;
