import { z } from "zod";
import type { ListQueryParams, PaginatedResponse } from "../shared/contracts";

export const FinancialGoalStatusSchema = z.enum(["IN_PROGRESS", "COMPLETED"]);

export const GoalContributionSchema = z.object({
  idGoalContribution: z.string(),
  idFinancialGoal: z.string(),
  amount: z.number(),
  contributedAt: z.string(),
  note: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const FinancialGoalSchema = z.object({
  idFinancialGoal: z.string(),
  idUsers: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  targetAmount: z.number(),
  currentAmount: z.number(),
  targetDate: z.string().nullable().optional(),
  status: FinancialGoalStatusSchema,
  progressPercent: z.number(),
  estimatedMonthsToComplete: z.number().nullable(),
  contributions: z.array(GoalContributionSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateFinancialGoalPayloadSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  targetAmount: z.number().positive(),
  targetDate: z.string().optional(),
});

export const UpdateFinancialGoalPayloadSchema = z.object({
  idFinancialGoal: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  targetAmount: z.number().positive().optional(),
  targetDate: z.string().optional(),
});

export const RegisterGoalContributionPayloadSchema = z.object({
  idFinancialGoal: z.string().min(1),
  amount: z.number().positive(),
  contributedAt: z.string().optional(),
  note: z.string().optional(),
});

export const UpdateGoalContributionPayloadSchema = z.object({
  idFinancialGoal: z.string().min(1),
  idGoalContribution: z.string().min(1),
  amount: z.number().positive().optional(),
  contributedAt: z.string().optional(),
  note: z.string().optional(),
});

export type GoalListQueryParams = ListQueryParams;

export type FinancialGoalStatus = z.infer<typeof FinancialGoalStatusSchema>;
export type GoalContribution = z.infer<typeof GoalContributionSchema>;
export type FinancialGoal = z.infer<typeof FinancialGoalSchema>;
export type CreateFinancialGoalPayload = z.infer<
  typeof CreateFinancialGoalPayloadSchema
>;
export type UpdateFinancialGoalPayload = z.infer<
  typeof UpdateFinancialGoalPayloadSchema
>;
export type RegisterGoalContributionPayload = z.infer<
  typeof RegisterGoalContributionPayloadSchema
>;
export type UpdateGoalContributionPayload = z.infer<
  typeof UpdateGoalContributionPayloadSchema
>;
export type FinancialGoalsResponse = PaginatedResponse<FinancialGoal>;
