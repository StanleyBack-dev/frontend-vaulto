import type { Category } from "@/api/categories/schema";

export interface CategoryFormValues {
  name: string;
  status: boolean;
}

export const emptyCategoryFormValues: CategoryFormValues = {
  name: "",
  status: true,
};

export function mapCategoryToFormValues(
  category: Category,
): CategoryFormValues {
  return {
    name: category.name,
    status: category.status,
  };
}
