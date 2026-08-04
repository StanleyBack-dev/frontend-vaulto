import { createCategory } from "@/api/categories/methods/create";
import { getCategoryById } from "@/api/categories/methods/get-by-id";
import { getMyCategories } from "@/api/categories/methods/get";
import { updateCategory } from "@/api/categories/methods/update";
import type {
  Category,
  CategoryListQueryParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/api/categories/schema";
import {
  CategorySchema,
  CreateCategoryPayloadSchema,
  UpdateCategoryPayloadSchema,
} from "@/api/categories/schema";
import type { PaginationMeta } from "@/api/shared/contracts";
import { categoryUiCopy } from "../model/messages";

export interface CategoriesCollectionResult {
  items: Category[];
  pagination: PaginationMeta;
}

export async function fetchCategories(
  params: CategoryListQueryParams = {},
): Promise<CategoriesCollectionResult> {
  const response = await getMyCategories(params);
  const parsed = CategorySchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(categoryUiCopy.errors.invalidCollectionData);
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

export async function fetchCategoryById(idCategory: string): Promise<Category> {
  const response = await getCategoryById(idCategory);
  const parsed = CategorySchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(categoryUiCopy.errors.invalidCollectionData);
  }

  return parsed.data;
}

export async function saveCategory(payload: {
  create: boolean;
  idCategory?: string;
  data: CreateCategoryPayload | UpdateCategoryPayload;
}): Promise<Category> {
  if (payload.create) {
    const parsedPayload = CreateCategoryPayloadSchema.safeParse(payload.data);
    if (!parsedPayload.success) {
      throw new Error(categoryUiCopy.errors.invalidCategoryData);
    }

    const response = await createCategory(parsedPayload.data);
    const parsedResponse = CategorySchema.safeParse(response);
    if (!parsedResponse.success) {
      throw new Error(categoryUiCopy.errors.invalidMutationData);
    }

    return parsedResponse.data;
  }

  const parsedPayload = UpdateCategoryPayloadSchema.safeParse(payload.data);
  if (!parsedPayload.success) {
    throw new Error(categoryUiCopy.errors.invalidCategoryData);
  }

  const response = await updateCategory(parsedPayload.data);
  const parsedResponse = CategorySchema.safeParse(response);
  if (!parsedResponse.success) {
    throw new Error(categoryUiCopy.errors.invalidMutationData);
  }

  return parsedResponse.data;
}
