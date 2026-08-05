import { z } from "zod";
import type { ListQueryParams, PaginatedResponse } from "../shared/contracts";

export const CategoryTypeSchema = z.enum(["EXPENSE", "INCOME"]);

export const CategorySchema = z.object({
  idCategory: z.string(),
  idUsers: z.string(),
  name: z.string(),
  type: CategoryTypeSchema,
  status: z.boolean(),
  inactivatedAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateCategoryPayloadSchema = z.object({
  name: z.string().min(1),
  type: CategoryTypeSchema.optional(),
  status: z.boolean().optional(),
});

export const UpdateCategoryPayloadSchema = z.object({
  idCategory: z.string().min(1),
  name: z.string().min(1),
  type: CategoryTypeSchema.optional(),
  status: z.boolean(),
});

export interface CategoryListQueryParams extends ListQueryParams {
  status?: boolean;
  type?: CategoryType;
}

export type CategoryType = z.infer<typeof CategoryTypeSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CreateCategoryPayload = z.infer<typeof CreateCategoryPayloadSchema>;
export type UpdateCategoryPayload = z.infer<typeof UpdateCategoryPayloadSchema>;
export type CategoriesResponse = PaginatedResponse<Category>;
