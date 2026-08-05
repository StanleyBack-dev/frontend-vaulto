import type { DebtStatus, DebtType } from "@/api/debts/schema";

export interface DebtFormValues {
  title: string;
  idCategory: string;
  idCreditCard: string;
  description: string;
  debtType: DebtType;
  totalAmount: string;
  dueDate: string;
  acquiredAt: string;
  hasInstallments: boolean;
  installmentCount: string;
  installmentAmount: string;
  installmentEntryMode: "TOTAL" | "INSTALLMENT";
  status: DebtStatus;
}

export const emptyDebtFormValues: DebtFormValues = {
  title: "",
  idCategory: "",
  idCreditCard: "",
  description: "",
  debtType: "FIXED",
  totalAmount: "",
  dueDate: "",
  acquiredAt: "",
  hasInstallments: false,
  installmentCount: "",
  installmentAmount: "",
  installmentEntryMode: "TOTAL",
  status: "OPEN",
};

export const debtTypeOptions: Array<{ value: DebtType; label: string }> = [
  { value: "FIXED", label: "Fixa" },
  { value: "VARIABLE", label: "Variável" },
];

export const debtStatusOptions: Array<{ value: DebtStatus; label: string }> = [
  { value: "OPEN", label: "Em aberto" },
  { value: "PARTIALLY_PAID", label: "Parcialmente paga" },
  { value: "PAID", label: "Paga" },
  { value: "OVERDUE", label: "Vencida" },
];

export function debtStatusLabel(status: DebtStatus): string {
  const match = debtStatusOptions.find((item) => item.value === status);
  return match?.label || status;
}

export function debtTypeLabel(type: DebtType): string {
  const match = debtTypeOptions.find((item) => item.value === type);
  return match?.label || type;
}
