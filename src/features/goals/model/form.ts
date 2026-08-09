import type { FinancialGoalStatus } from "@/api/goals/schema";

export interface GoalFormValues {
  title: string;
  description: string;
  targetAmount: string;
  targetDate: string;
}

export const emptyGoalFormValues: GoalFormValues = {
  title: "",
  description: "",
  targetAmount: "",
  targetDate: "",
};

export const goalStatusOptions: Array<{
  value: FinancialGoalStatus;
  label: string;
}> = [
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "COMPLETED", label: "Concluída" },
];

export function goalStatusLabel(status: FinancialGoalStatus): string {
  const match = goalStatusOptions.find((item) => item.value === status);
  return match?.label || status;
}
