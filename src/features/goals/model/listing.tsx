import { Trash2 } from "lucide-react";
import type { FinancialGoal } from "@/api/goals/schema";
import type { DataTableColumn } from "@/components/organisms/DataTable";
import EditIcon from "@/components/atoms/icons/EditIcon";
import { formatDateDisplay } from "@/utils/format";
import { goalStatusLabel } from "./form";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(value?: string | null): string {
  return formatDateDisplay(value ?? undefined) || "-";
}

function getStatusPillStyle(status: FinancialGoal["status"]) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    default:
      return "bg-violet-100 text-violet-800 border border-violet-300";
  }
}

export function filterGoalsBySearch(
  goals: FinancialGoal[],
  search: string,
): FinancialGoal[] {
  const query = search.trim().toLowerCase();

  if (!query) return goals;

  return goals.filter((goal) => {
    return (
      goal.title.toLowerCase().includes(query) ||
      (goal.description || "").toLowerCase().includes(query)
    );
  });
}

export function getGoalTableColumns(actions: {
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (goal: FinancialGoal) => void;
}): DataTableColumn<FinancialGoal>[] {
  return [
    {
      key: "actions",
      label: "Ações",
      render: (goal) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            title="Editar"
            className="text-violet-700 transition hover:text-violet-900"
            onClick={(event) => {
              event.stopPropagation();
              actions.onEdit(goal);
            }}
          >
            <EditIcon size={18} />
          </button>
          <button
            type="button"
            title="Excluir"
            className="text-rose-600 transition hover:text-rose-800"
            onClick={(event) => {
              event.stopPropagation();
              actions.onDelete(goal);
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
    {
      key: "title",
      label: "Título",
      render: (goal) => (
        <p className="text-sm font-semibold text-[#1a1333] min-w-[180px]">
          {goal.title}
        </p>
      ),
    },
    {
      key: "targetAmount",
      label: "Valor alvo",
      render: (goal) => (
        <span className="text-sm font-semibold text-[#1a1333]">
          {formatCurrency(goal.targetAmount)}
        </span>
      ),
    },
    {
      key: "currentAmount",
      label: "Valor atual",
      render: (goal) => (
        <span className="text-sm text-emerald-700">
          {formatCurrency(goal.currentAmount)}
        </span>
      ),
    },
    {
      key: "remainingAmount",
      label: "Valor restante",
      render: (goal) => (
        <span className="text-sm text-[#5a4e7a]">
          {formatCurrency(Math.max(goal.targetAmount - goal.currentAmount, 0))}
        </span>
      ),
    },
    {
      key: "progressPercent",
      label: "Progresso",
      render: (goal) => (
        <span className="text-sm text-[#5a4e7a]">{goal.progressPercent}%</span>
      ),
    },
    {
      key: "targetDate",
      label: "Data alvo",
      render: (goal) => (
        <span className="text-sm text-[#4a3f6b]">
          {formatDate(goal.targetDate)}
        </span>
      ),
    },
    {
      key: "estimatedMonthsToComplete",
      label: "Previsão",
      render: (goal) => (
        <span className="text-sm text-[#5a4e7a]">
          {goal.status === "COMPLETED"
            ? "Concluída"
            : goal.estimatedMonthsToComplete !== null
              ? `${goal.estimatedMonthsToComplete} mês(es)`
              : "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (goal) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusPillStyle(goal.status)}`}
        >
          {goalStatusLabel(goal.status)}
        </span>
      ),
    },
  ];
}
