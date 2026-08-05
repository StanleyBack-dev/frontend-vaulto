import type { Category, CategoryType } from "@/api/categories/schema";

export interface CategoryFormValues {
  name: string;
  type: CategoryType;
  status: boolean;
}

export const emptyCategoryFormValues: CategoryFormValues = {
  name: "",
  type: "EXPENSE",
  status: true,
};

export const categoryTypeOptions: Array<{
  value: CategoryType;
  label: string;
}> = [
  { value: "EXPENSE", label: "Despesa" },
  { value: "INCOME", label: "Receita" },
];

export function categoryTypeLabel(type: CategoryType): string {
  const match = categoryTypeOptions.find((option) => option.value === type);
  return match?.label ?? type;
}

export function mapCategoryToFormValues(
  category: Category,
): CategoryFormValues {
  return {
    name: category.name,
    type: category.type,
    status: category.status,
  };
}
