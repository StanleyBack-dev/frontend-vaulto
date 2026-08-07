import { z } from "zod";

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
  cancelAtPeriodEnd: z.boolean(),
});

export const SubscribeToProPayloadSchema = z.object({
  cpfCnpj: z.string(),
  billingCycle: SubscriptionBillingCycleSchema,
});

export const SubscribeToProResponseSchema = z.object({
  subscription: SubscriptionSchema,
  checkoutUrl: z.string().nullable().optional(),
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
