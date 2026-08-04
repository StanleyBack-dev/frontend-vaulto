import { z } from "zod";
import type { ListQueryParams, PaginatedResponse } from "../shared/contracts";

export const CategorySchema = z.object({
  idCategory: z.string(),
  idUsers: z.string(),
  name: z.string(),
  status: z.boolean(),
  inactivatedAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateCategoryPayloadSchema = z.object({
  name: z.string().min(1),
  status: z.boolean().optional(),
});

export const UpdateCategoryPayloadSchema = z.object({
  idCategory: z.string().min(1),
  name: z.string().min(1),
  status: z.boolean(),
});

export interface CategoryListQueryParams extends ListQueryParams {
  status?: boolean;
}

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategoryPayload = z.infer<typeof CreateCategoryPayloadSchema>;
export type UpdateCategoryPayload = z.infer<typeof UpdateCategoryPayloadSchema>;
export type CategoriesResponse = PaginatedResponse<Category>;
