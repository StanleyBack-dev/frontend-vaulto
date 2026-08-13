import { createCreditCard } from "@/api/credit-cards/methods/create";
import { getCreditCardById } from "@/api/credit-cards/methods/get-by-id";
import { getMyCreditCards } from "@/api/credit-cards/methods/get";
import { getMyCreditCardOptions } from "@/api/credit-cards/methods/get-options";
import { updateCreditCard } from "@/api/credit-cards/methods/update";
import type {
  CreditCard,
  CreditCardListQueryParams,
  CreateCreditCardPayload,
  UpdateCreditCardPayload,
} from "@/api/credit-cards/schema";
import {
  CreditCardSchema,
  CreateCreditCardPayloadSchema,
  UpdateCreditCardPayloadSchema,
} from "@/api/credit-cards/schema";
import type { PaginationMeta } from "@/api/shared/contracts";
import { creditCardUiCopy } from "../model/messages";

export interface CreditCardsCollectionResult {
  items: CreditCard[];
  pagination: PaginationMeta;
}

export async function fetchCreditCards(
  params: CreditCardListQueryParams = {},
): Promise<CreditCardsCollectionResult> {
  const response = await getMyCreditCards(params);
  const parsed = CreditCardSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(creditCardUiCopy.errors.invalidCollectionData);
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

export async function fetchCreditCardOptions(
  params: CreditCardListQueryParams = {},
): Promise<CreditCardsCollectionResult> {
  const response = await getMyCreditCardOptions(params);
  const parsed = CreditCardSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(creditCardUiCopy.errors.invalidCollectionData);
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

export async function fetchCreditCardById(
  idCreditCard: string,
): Promise<CreditCard> {
  const response = await getCreditCardById(idCreditCard);
  const parsed = CreditCardSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(creditCardUiCopy.errors.invalidCollectionData);
  }

  return parsed.data;
}

export async function saveCreditCard(payload: {
  create: boolean;
  idCreditCard?: string;
  data: CreateCreditCardPayload | UpdateCreditCardPayload;
}): Promise<CreditCard> {
  if (payload.create) {
    const parsedPayload = CreateCreditCardPayloadSchema.safeParse(payload.data);
    if (!parsedPayload.success) {
      throw new Error(creditCardUiCopy.errors.invalidCreditCardData);
    }

    const response = await createCreditCard(parsedPayload.data);
    const parsedResponse = CreditCardSchema.safeParse(response);
    if (!parsedResponse.success) {
      throw new Error(creditCardUiCopy.errors.invalidMutationData);
    }

    return parsedResponse.data;
  }

  const parsedPayload = UpdateCreditCardPayloadSchema.safeParse(payload.data);
  if (!parsedPayload.success) {
    throw new Error(creditCardUiCopy.errors.invalidCreditCardData);
  }

  const response = await updateCreditCard(parsedPayload.data);
  const parsedResponse = CreditCardSchema.safeParse(response);
  if (!parsedResponse.success) {
    throw new Error(creditCardUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}
