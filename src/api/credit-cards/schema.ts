import { z } from "zod";
import type { ListQueryParams, PaginatedResponse } from "../shared/contracts";

export const CreditCardSchema = z.object({
  idCreditCard: z.string(),
  idUsers: z.string(),
  name: z.string(),
  creditLimit: z.number(),
  dueDay: z.number(),
  closingDay: z.number(),
  status: z.boolean(),
  usedLimit: z.number(),
  availableLimit: z.number(),
  inactivatedAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateCreditCardPayloadSchema = z.object({
  name: z.string().min(1),
  creditLimit: z.number().positive(),
  dueDay: z.number().int().min(1).max(31),
  closingDay: z.number().int().min(1).max(31),
  status: z.boolean().optional(),
});

export const UpdateCreditCardPayloadSchema = z.object({
  idCreditCard: z.string().min(1),
  name: z.string().min(1),
  creditLimit: z.number().positive(),
  dueDay: z.number().int().min(1).max(31),
  closingDay: z.number().int().min(1).max(31),
  status: z.boolean(),
});

export interface CreditCardListQueryParams extends ListQueryParams {
  status?: boolean;
}

export type CreditCard = z.infer<typeof CreditCardSchema>;
export type CreateCreditCardPayload = z.infer<
  typeof CreateCreditCardPayloadSchema
>;
export type UpdateCreditCardPayload = z.infer<
  typeof UpdateCreditCardPayloadSchema
>;
export type CreditCardsResponse = PaginatedResponse<CreditCard>;
