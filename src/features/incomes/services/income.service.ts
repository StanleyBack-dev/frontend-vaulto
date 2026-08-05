import { createIncome } from "@/api/incomes/methods/create";
import { deleteIncome } from "@/api/incomes/methods/delete";
import { getIncomeById } from "@/api/incomes/methods/get-by-id";
import { getMyIncomes } from "@/api/incomes/methods/get";
import { updateIncomeDetails } from "@/api/incomes/methods/update-details";
import { updateIncomeStatus } from "@/api/incomes/methods/update-status";
import type {
  CreateIncomePayload,
  Income,
  IncomeListQueryParams,
  UpdateIncomeDetailsPayload,
  UpdateIncomeStatusPayload,
} from "@/api/incomes/schema";
import {
  CreateIncomePayloadSchema,
  IncomeSchema,
  UpdateIncomeDetailsPayloadSchema,
  UpdateIncomeStatusPayloadSchema,
} from "@/api/incomes/schema";
import type { PaginationMeta } from "@/api/shared/contracts";
import { incomeUiCopy } from "../model/messages";

export interface IncomesCollectionResult {
  items: Income[];
  pagination: PaginationMeta;
}

export async function fetchIncomes(
  params: IncomeListQueryParams = {},
): Promise<IncomesCollectionResult> {
  const response = await getMyIncomes(params);
  const parsed = IncomeSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(incomeUiCopy.errors.invalidCollectionData);
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

export async function fetchIncomeById(idIncome: string): Promise<Income> {
  const response = await getIncomeById(idIncome);
  const parsed = IncomeSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(incomeUiCopy.errors.invalidCollectionData);
  }

  return parsed.data;
}

export async function saveIncome(
  payload: CreateIncomePayload,
): Promise<Income> {
  const parsedPayload = CreateIncomePayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(incomeUiCopy.errors.invalidIncomeData);
  }

  const response = await createIncome(parsedPayload.data);
  const parsedResponse = IncomeSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(incomeUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}

export async function saveIncomeStatus(payload: UpdateIncomeStatusPayload) {
  const parsedPayload = UpdateIncomeStatusPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(incomeUiCopy.errors.invalidIncomeData);
  }

  const response = await updateIncomeStatus(parsedPayload.data);
  const parsedResponse = IncomeSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(incomeUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}

export async function saveIncomeDetails(payload: UpdateIncomeDetailsPayload) {
  const parsedPayload = UpdateIncomeDetailsPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(incomeUiCopy.errors.invalidIncomeData);
  }

  const response = await updateIncomeDetails(parsedPayload.data);
  const parsedResponse = IncomeSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(incomeUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}

export async function removeIncome(idIncome: string): Promise<void> {
  await deleteIncome(idIncome);
}
