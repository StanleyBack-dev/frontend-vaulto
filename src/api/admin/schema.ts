import { z } from "zod";
import {
  SubscriptionBillingCycleSchema,
  SubscriptionPlanSchema,
  SubscriptionStatusSchema,
} from "../billing/schema";
import type { ListQueryParams, PaginatedResponse } from "../shared/contracts";
import { UserGroupSchema } from "../users/schema";

export const UsersByGroupCountSchema = z.object({
  group: UserGroupSchema,
  count: z.number(),
});

export const SubscriptionsByStatusCountSchema = z.object({
  status: SubscriptionStatusSchema,
  count: z.number(),
});

export const AdminDashboardStatsSchema = z.object({
  totalUsers: z.number(),
  usersByGroup: z.array(UsersByGroupCountSchema),
  totalSubscriptions: z.number(),
  freeSubscriptions: z.number(),
  activeProSubscriptions: z.number(),
  subscriptionsByStatus: z.array(SubscriptionsByStatusCountSchema),
  estimatedMonthlyRecurringRevenue: z.number(),
  totalSupportTickets: z.number(),
  openSupportTickets: z.number(),
  resolvedSupportTickets: z.number(),
});

export type AdminDashboardStats = z.infer<typeof AdminDashboardStatsSchema>;

export const AdminReferralStatsSchema = z.object({
  totalReferredUsers: z.number(),
  totalQualifiedReferrals: z.number(),
  creditAmountCents: z.number(),
  totalCreditsGrantedCents: z.number(),
  totalClawedBackCents: z.number(),
  totalWithdrawnCents: z.number(),
  totalPendingWithdrawalCents: z.number(),
  totalFailedWithdrawalCents: z.number(),
  totalOutstandingLiabilityCents: z.number(),
});

export const AdminReferralMonthlyPointSchema = z.object({
  month: z.string(),
  qualifiedReferrals: z.number(),
  creditsGrantedCents: z.number(),
});

export const AdminReferralLeaderboardRowSchema = z.object({
  idUsers: z.string(),
  name: z.string(),
  email: z.string(),
  qualifiedReferralsCount: z.number(),
  totalCreditsGrantedCents: z.number(),
  availableBalanceCents: z.number(),
});

export type AdminReferralStats = z.infer<typeof AdminReferralStatsSchema>;
export type AdminReferralMonthlyPoint = z.infer<
  typeof AdminReferralMonthlyPointSchema
>;
export type AdminReferralLeaderboardRow = z.infer<
  typeof AdminReferralLeaderboardRowSchema
>;

export interface AdminReferralTrendQueryParams {
  dateFrom: string;
  dateTo: string;
}

export const AdminProLeadEventTypeSchema = z.enum([
  "PLAN_CLICKED",
  "CHECKOUT_REACHED",
]);

export const AdminProLeadStatsSchema = z.object({
  totalPlanClicks: z.number(),
  totalCheckoutReached: z.number(),
  uniqueUsersClicked: z.number(),
  uniqueUsersReachedCheckout: z.number(),
  convertedToProCount: z.number(),
});

export const AdminProLeadRowSchema = z.object({
  idProLeadEvent: z.string(),
  idUsers: z.string(),
  name: z.string(),
  email: z.string(),
  eventType: AdminProLeadEventTypeSchema,
  billingCycle: SubscriptionBillingCycleSchema.nullable().optional(),
  checkoutUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  currentPlan: SubscriptionPlanSchema,
  currentSubscriptionStatus: SubscriptionStatusSchema.nullable().optional(),
});

export type AdminProLeadEventType = z.infer<typeof AdminProLeadEventTypeSchema>;
export type AdminProLeadStats = z.infer<typeof AdminProLeadStatsSchema>;
export type AdminProLeadRow = z.infer<typeof AdminProLeadRowSchema>;

export interface AdminProLeadsQueryParams extends ListQueryParams {
  eventType?: AdminProLeadEventType;
}

export type AdminProLeadsResponse = PaginatedResponse<AdminProLeadRow>;
