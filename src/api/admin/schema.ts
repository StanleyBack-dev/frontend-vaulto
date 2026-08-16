import { z } from "zod";
import { SubscriptionStatusSchema } from "../billing/schema";
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
