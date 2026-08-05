import type { IncomeStatus, IncomeType } from "@/api/incomes/schema";

export interface IncomeFormValues {
  title: string;
  idCategory: string;
  description: string;
  incomeType: IncomeType;
  totalAmount: string;
  dueDate: string;
  hasInstallments: boolean;
  installmentCount: string;
  installmentAmount: string;
  installmentEntryMode: "TOTAL" | "INSTALLMENT";
  isRecurring: boolean;
  status: IncomeStatus;
}

export const emptyIncomeFormValues: IncomeFormValues = {
  title: "",
  idCategory: "",
  description: "",
  incomeType: "FIXED",
  totalAmount: "",
  dueDate: "",
  hasInstallments: false,
  installmentCount: "",
  installmentAmount: "",
  installmentEntryMode: "TOTAL",
  isRecurring: false,
  status: "PENDING",
};

export const incomeTypeOptions: Array<{ value: IncomeType; label: string }> = [
  { value: "FIXED", label: "Fixa" },
  { value: "VARIABLE", label: "Variável" },
];

export const incomeStatusOptions: Array<{
  value: IncomeStatus;
  label: string;
}> = [
  { value: "PENDING", label: "Pendente" },
  { value: "PARTIALLY_RECEIVED", label: "Parcialmente recebida" },
  { value: "RECEIVED", label: "Recebida" },
  { value: "OVERDUE", label: "Vencida" },
];

export function incomeStatusLabel(status: IncomeStatus): string {
  const match = incomeStatusOptions.find((item) => item.value === status);
  return match?.label || status;
}

export function incomeTypeLabel(type: IncomeType): string {
  const match = incomeTypeOptions.find((item) => item.value === type);
  return match?.label || type;
}
