import { createFinancialGoal } from "@/api/goals/methods/create";
import { deleteFinancialGoal } from "@/api/goals/methods/delete";
import { deleteGoalContribution } from "@/api/goals/methods/delete-contribution";
import { getFinancialGoalById } from "@/api/goals/methods/get-by-id";
import { getMyFinancialGoals } from "@/api/goals/methods/get";
import { registerGoalContribution } from "@/api/goals/methods/register-contribution";
import { updateFinancialGoal } from "@/api/goals/methods/update";
import { updateGoalContribution as updateGoalContributionRequest } from "@/api/goals/methods/update-contribution";
import type {
  CreateFinancialGoalPayload,
  FinancialGoal,
  GoalListQueryParams,
  RegisterGoalContributionPayload,
  UpdateFinancialGoalPayload,
  UpdateGoalContributionPayload,
} from "@/api/goals/schema";
import {
  CreateFinancialGoalPayloadSchema,
  FinancialGoalSchema,
  RegisterGoalContributionPayloadSchema,
  UpdateFinancialGoalPayloadSchema,
  UpdateGoalContributionPayloadSchema,
} from "@/api/goals/schema";
import type { PaginationMeta } from "@/api/shared/contracts";
import { goalUiCopy } from "../model/messages";

export interface GoalsCollectionResult {
  items: FinancialGoal[];
  pagination: PaginationMeta;
}

export async function fetchGoals(
  params: GoalListQueryParams = {},
): Promise<GoalsCollectionResult> {
  const response = await getMyFinancialGoals(params);
  const parsed = FinancialGoalSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(goalUiCopy.errors.invalidCollectionData);
  }

  return {
    items: parsed.data,
    pagination: {
      total: response.total,
      currentPage: response.currentPage,
      limit: response.limit,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
    },
  };
}

export async function fetchGoalById(
  idFinancialGoal: string,
): Promise<FinancialGoal> {
  const response = await getFinancialGoalById(idFinancialGoal);
  const parsed = FinancialGoalSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(goalUiCopy.errors.invalidCollectionData);
  }

  return parsed.data;
}

export async function saveGoal(
  payload: CreateFinancialGoalPayload,
): Promise<FinancialGoal> {
  const parsedPayload = CreateFinancialGoalPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(goalUiCopy.errors.invalidGoalData);
  }

  const response = await createFinancialGoal(parsedPayload.data);
  const parsedResponse = FinancialGoalSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(goalUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}

export async function saveGoalDetails(
  payload: UpdateFinancialGoalPayload,
): Promise<FinancialGoal> {
  const parsedPayload = UpdateFinancialGoalPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(goalUiCopy.errors.invalidGoalData);
  }

  const response = await updateFinancialGoal(parsedPayload.data);
  const parsedResponse = FinancialGoalSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(goalUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}

export async function removeGoal(idFinancialGoal: string): Promise<void> {
  await deleteFinancialGoal(idFinancialGoal);
}

export async function saveGoalContribution(
  payload: RegisterGoalContributionPayload,
): Promise<FinancialGoal> {
  const parsedPayload =
    RegisterGoalContributionPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(goalUiCopy.errors.invalidGoalData);
  }

  const response = await registerGoalContribution(parsedPayload.data);
  const parsedResponse = FinancialGoalSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(goalUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}

export async function saveGoalContributionDetails(
  payload: UpdateGoalContributionPayload,
): Promise<FinancialGoal> {
  const parsedPayload = UpdateGoalContributionPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(goalUiCopy.errors.invalidGoalData);
  }

  const response = await updateGoalContributionRequest(parsedPayload.data);
  const parsedResponse = FinancialGoalSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(goalUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}

export async function removeGoalContribution(
  idFinancialGoal: string,
  idGoalContribution: string,
): Promise<FinancialGoal> {
  const response = await deleteGoalContribution(
    idFinancialGoal,
    idGoalContribution,
  );
  const parsedResponse = FinancialGoalSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(goalUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}
