import { z } from "zod";
import type { ListQueryParams } from "../shared/contracts";

export const SubscriptionPlanSchema = z.enum(["FREE", "PRO"]);
export const SubscriptionStatusSchema = z.enum([
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
  "EXPIRED",
]);
export const SubscriptionBillingCycleSchema = z.enum(["MONTHLY", "YEARLY"]);

export const SubscriptionSchema = z.object({
  plan: SubscriptionPlanSchema,
  status: SubscriptionStatusSchema,
  trialEndsAt: z.string().nullable().optional(),
  currentPeriodEnd: z.string().nullable().optional(),
  billingCycle: SubscriptionBillingCycleSchema.nullable().optional(),
  cancelAtPeriodEnd: z.boolean(),
});

export const SubscribeToProPayloadSchema = z.object({
  cpfCnpj: z.string(),
  billingCycle: SubscriptionBillingCycleSchema,
  pixAutomatic: z.boolean().optional(),
});

export const SubscribeToProResponseSchema = z.object({
  subscription: SubscriptionSchema,
  checkoutUrl: z.string().nullable().optional(),
  pixQrCodePayload: z.string().nullable().optional(),
  pixQrCodeImage: z.string().nullable().optional(),
});

export const CancellationReasonSchema = z.enum([
  "DOES_NOT_MEET_NEEDS",
  "TOO_EXPENSIVE",
  "FOUND_ALTERNATIVE",
  "HARD_TO_USE",
  "MISSING_FEATURES",
  "TEMPORARY_USE",
  "TECHNICAL_ISSUES",
  "OTHER",
]);

export const CancelSubscriptionPayloadSchema = z.object({
  reasons: z.array(CancellationReasonSchema).min(1),
  otherReason: z.string().optional(),
});

export const BillingPaymentStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "RECEIVED",
  "OVERDUE",
  "REFUNDED",
  "DELETED",
]);

export const BillingPaymentSchema = z.object({
  amount: z.number(),
  status: BillingPaymentStatusSchema,
  dueDate: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const BillingPaymentsResponseSchema = z.object({
  items: z.array(BillingPaymentSchema),
  total: z.number(),
  currentPage: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
});

export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type SubscriptionBillingCycle = z.infer<
  typeof SubscriptionBillingCycleSchema
>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type SubscribeToProPayload = z.infer<typeof SubscribeToProPayloadSchema>;
export type SubscribeToProResponse = z.infer<
  typeof SubscribeToProResponseSchema
>;
export type CancellationReason = z.infer<typeof CancellationReasonSchema>;
export type CancelSubscriptionPayload = z.infer<
  typeof CancelSubscriptionPayloadSchema
>;
export type BillingPaymentStatus = z.infer<typeof BillingPaymentStatusSchema>;
export type BillingPayment = z.infer<typeof BillingPaymentSchema>;
export type BillingPaymentsResponse = z.infer<
  typeof BillingPaymentsResponseSchema
>;

export type BillingPaymentListQueryParams = ListQueryParams;
