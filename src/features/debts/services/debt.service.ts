import { createDebt } from "@/api/debts/methods/create";
import { deleteDebt } from "@/api/debts/methods/delete";
import { getDebtById } from "@/api/debts/methods/get-by-id";
import { getMyDebts } from "@/api/debts/methods/get";
import { getMyDebtOptions } from "@/api/debts/methods/get-options";
import { updateDebtDetails } from "@/api/debts/methods/update-details";
import { updateDebtStatus } from "@/api/debts/methods/update-status";
import type {
  CreateDebtPayload,
  Debt,
  DebtListQueryParams,
  UpdateDebtDetailsPayload,
  UpdateDebtStatusPayload,
} from "@/api/debts/schema";
import {
  CreateDebtPayloadSchema,
  DebtSchema,
  UpdateDebtDetailsPayloadSchema,
  UpdateDebtStatusPayloadSchema,
} from "@/api/debts/schema";
import type { PaginationMeta } from "@/api/shared/contracts";
import { debtUiCopy } from "../model/messages";

export interface DebtsCollectionResult {
  items: Debt[];
  pagination: PaginationMeta;
}

export async function fetchDebts(
  params: DebtListQueryParams = {},
): Promise<DebtsCollectionResult> {
  const response = await getMyDebts(params);
  const parsed = DebtSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(debtUiCopy.errors.invalidCollectionData);
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

const DEBT_OPTIONS_PAGE_SIZE = 100;
const DEBT_OPTIONS_MAX_PAGES = 20;

/**
 * Fetches every debt of the current user for use in pickers/dropdowns, walking
 * through the paginated endpoint so the caller is never capped at a single page.
 */
export async function fetchDebtOptions(): Promise<Debt[]> {
  const items: Debt[] = [];

  for (let page = 1; page <= DEBT_OPTIONS_MAX_PAGES; page += 1) {
    const response = await getMyDebtOptions({
      page,
      limit: DEBT_OPTIONS_PAGE_SIZE,
    });

    const parsed = DebtSchema.array().safeParse(response.items);

    if (!parsed.success) {
      throw new Error(debtUiCopy.errors.invalidCollectionData);
    }

    items.push(...parsed.data);

    if (!response.hasNextPage) {
      break;
    }
  }

  return items;
}

export async function fetchDebtById(idDebt: string): Promise<Debt> {
  const response = await getDebtById(idDebt);
  const parsed = DebtSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(debtUiCopy.errors.invalidCollectionData);
  }

  return parsed.data;
}

export async function saveDebt(payload: CreateDebtPayload): Promise<Debt> {
  const parsedPayload = CreateDebtPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(debtUiCopy.errors.invalidDebtData);
  }

  const response = await createDebt(parsedPayload.data);
  const parsedResponse = DebtSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(debtUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}

export async function saveDebtStatus(payload: UpdateDebtStatusPayload) {
  const parsedPayload = UpdateDebtStatusPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(debtUiCopy.errors.invalidDebtData);
  }

  const response = await updateDebtStatus(parsedPayload.data);
  const parsedResponse = DebtSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(debtUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}

export async function removeDebt(idDebt: string): Promise<void> {
  await deleteDebt(idDebt);
}

export async function saveDebtDetails(payload: UpdateDebtDetailsPayload) {
  const parsedPayload = UpdateDebtDetailsPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(debtUiCopy.errors.invalidDebtData);
  }

  const response = await updateDebtDetails(parsedPayload.data);
  const parsedResponse = DebtSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(debtUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}
