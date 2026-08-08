import { Trash2 } from "lucide-react";
import type { Income } from "@/api/incomes/schema";
import type { DataTableColumn } from "@/components/organisms/DataTable";
import EditIcon from "@/components/atoms/icons/EditIcon";
import { formatDateDisplay } from "@/utils/format";
import { incomeStatusLabel, incomeTypeLabel } from "./form";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(value?: string | null): string {
  return formatDateDisplay(value ?? undefined) || "-";
}

export function getReceivedAmount(income: Income): number {
  return income.installments.reduce(
    (sum, installment) => sum + installment.amountReceived,
    0,
  );
}

export function getRemainingAmount(income: Income): number {
  return Math.max(income.totalAmount - getReceivedAmount(income), 0);
}

export function getInstallmentAmount(income: Income): number {
  if (income.installments[0]) {
    return income.installments[0].amountDue;
  }

  const installmentCount = income.installmentCount ?? 0;

  return installmentCount > 0 ? income.totalAmount / installmentCount : 0;
}

export function getReceivedInstallmentsCount(income: Income): number {
  return income.installments.filter(
    (installment) => installment.status === "RECEIVED",
  ).length;
}

export function getRemainingInstallmentsCount(income: Income): number {
  return income.installments.filter(
    (installment) => installment.status !== "RECEIVED",
  ).length;
}

// The due date column must always reflect what's actually pending, not the
// original registration date: for an installment income that's the
// unreceived installment whose due date sits closest to today (covering both
// an upcoming installment and one that's already overdue), not necessarily
// the first or last one in the schedule.
export function getNearestDueDate(income: Income): string | null {
  if (!income.hasInstallments) {
    return income.dueDate ?? null;
  }

  const pendingInstallments = income.installments.filter(
    (installment) => installment.status !== "RECEIVED",
  );

  if (!pendingInstallments.length) {
    return null;
  }

  const now = Date.now();

  return pendingInstallments.reduce((nearest, installment) => {
    const nearestDiff = Math.abs(new Date(nearest.dueDate).getTime() - now);
    const installmentDiff = Math.abs(
      new Date(installment.dueDate).getTime() - now,
    );

    return installmentDiff < nearestDiff ? installment : nearest;
  }, pendingInstallments[0]).dueDate;
}

function getStatusPillStyle(status: Income["status"]) {
  switch (status) {
    case "RECEIVED":
      return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    case "PARTIALLY_RECEIVED":
      return "bg-amber-100 text-amber-800 border border-amber-300";
    case "OVERDUE":
      return "bg-rose-100 text-rose-800 border border-rose-300";
    default:
      return "bg-violet-100 text-violet-800 border border-violet-300";
  }
}

export function filterIncomesBySearch(
  incomes: Income[],
  search: string,
): Income[] {
  const query = search.trim().toLowerCase();

  if (!query) return incomes;

  return incomes.filter((income) => {
    return (
      income.title.toLowerCase().includes(query) ||
      income.category.toLowerCase().includes(query) ||
      (income.description || "").toLowerCase().includes(query)
    );
  });
}

export function getIncomeTableColumns(actions: {
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
}): DataTableColumn<Income>[] {
  return [
    {
      key: "actions",
      label: "Ações",
      render: (income) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            title="Editar"
            className="text-violet-700 transition hover:text-violet-900"
            onClick={(event) => {
              event.stopPropagation();
              actions.onEdit(income);
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
              actions.onDelete(income);
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
      render: (income) => (
        <p className="text-sm font-semibold text-[#1a1333] min-w-[180px]">
          {income.title}
        </p>
      ),
    },
    {
      key: "category",
      label: "Categoria",
      render: (income) => (
        <span className="text-sm text-[#5a4e7a] min-w-[120px]">
          {income.category}
        </span>
      ),
    },
    {
      key: "incomeType",
      label: "Tipo",
      render: (income) => (
        <span className="text-sm text-[#2d2060]">
          {incomeTypeLabel(income.incomeType)}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: "Valor",
      render: (income) => (
        <span className="text-sm font-semibold text-[#1a1333]">
          {formatCurrency(income.totalAmount)}
        </span>
      ),
    },
    {
      key: "installmentCount",
      label: "Parcelas",
      render: (income) => (
        <span className="text-sm text-[#5a4e7a]">
          {income.hasInstallments ? income.installmentCount : "-"}
        </span>
      ),
    },
    {
      key: "receivedInstallmentsCount",
      label: "Parcelas recebidas",
      render: (income) => (
        <span className="text-sm text-[#5a4e7a]">
          {income.hasInstallments ? getReceivedInstallmentsCount(income) : "-"}
        </span>
      ),
    },
    {
      key: "installmentAmount",
      label: "Valor da parcela",
      render: (income) => (
        <span className="text-sm text-[#5a4e7a]">
          {income.hasInstallments
            ? formatCurrency(getInstallmentAmount(income))
            : "-"}
        </span>
      ),
    },
    {
      key: "receivedAmount",
      label: "Valor recebido",
      render: (income) => (
        <span className="text-sm text-emerald-700">
          {formatCurrency(getReceivedAmount(income))}
        </span>
      ),
    },
    {
      key: "remainingAmount",
      label: "Valor restante",
      render: (income) => (
        <span className="text-sm text-[#5a4e7a]">
          {formatCurrency(getRemainingAmount(income))}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (income) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusPillStyle(income.status)}`}
        >
          {incomeStatusLabel(income.status)}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Data esperada",
      render: (income) => (
        <span className="text-sm text-[#4a3f6b]">
          {formatDate(getNearestDueDate(income))}
        </span>
      ),
    },
    {
      key: "receivedAt",
      label: "Data de recebimento",
      render: (income) => (
        <span className="text-sm text-[#4a3f6b]">
          {formatDate(income.receivedAt)}
        </span>
      ),
    },
  ];
}
