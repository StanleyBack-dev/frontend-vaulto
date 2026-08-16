import { Trash2 } from "lucide-react";
import type { Debt } from "@/api/debts/schema";
import type { DataTableColumn } from "@/components/organisms/DataTable";
import EditIcon from "@/components/atoms/icons/EditIcon";
import { formatDateDisplay } from "@/utils/format";
import { debtStatusLabel, debtTypeLabel } from "./form";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(value?: string | null): string {
  return formatDateDisplay(value ?? undefined) || "-";
}

export function getPaidAmount(debt: Debt): number {
  return debt.payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
}

export function getRemainingAmount(debt: Debt): number {
  return Math.max(debt.totalAmount - getPaidAmount(debt), 0);
}

export function getInstallmentAmount(debt: Debt): number {
  if (debt.installments[0]) {
    return debt.installments[0].amountDue;
  }

  const installmentCount = debt.installmentCount ?? 0;

  return installmentCount > 0 ? debt.totalAmount / installmentCount : 0;
}

export function getPaidInstallmentsCount(debt: Debt): number {
  return debt.installments.filter(
    (installment) => installment.status === "PAID",
  ).length;
}

export function getRemainingInstallmentsCount(debt: Debt): number {
  return debt.installments.filter(
    (installment) => installment.status !== "PAID",
  ).length;
}

// The due date column must always reflect what's actually pending, not the
// original registration date: for an installment debt that's the unpaid
// installment whose due date sits closest to today (covering both an
// upcoming installment and one that's already overdue), not necessarily the
// first or last one in the schedule.
export function getNearestDueDate(debt: Debt): string | null {
  if (!debt.hasInstallments) {
    return debt.dueDate ?? null;
  }

  const pendingInstallments = debt.installments.filter(
    (installment) => installment.status !== "PAID",
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

function getStatusPillStyle(status: Debt["status"]) {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    case "PARTIALLY_PAID":
      return "bg-amber-100 text-amber-800 border border-amber-300";
    case "OVERDUE":
      return "bg-rose-100 text-rose-800 border border-rose-300";
    default:
      return "bg-violet-100 text-violet-800 border border-violet-300";
  }
}

export function filterDebtsBySearch(debts: Debt[], search: string): Debt[] {
  const query = search.trim().toLowerCase();

  if (!query) return debts;

  return debts.filter((debt) => {
    return (
      debt.title.toLowerCase().includes(query) ||
      debt.category.toLowerCase().includes(query) ||
      debt.status.toLowerCase().includes(query) ||
      (debt.description || "").toLowerCase().includes(query)
    );
  });
}

export function getDebtTableColumns(actions: {
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}): DataTableColumn<Debt>[] {
  return [
    {
      key: "actions",
      label: "Ações",
      render: (debt) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            title="Editar"
            className="text-violet-700 transition hover:text-violet-900"
            onClick={(event) => {
              event.stopPropagation();
              actions.onEdit(debt);
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
              actions.onDelete(debt);
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
      render: (debt) => (
        <p className="text-sm font-semibold text-[#1a1333] min-w-[180px]">
          {debt.title}
        </p>
      ),
    },
    {
      key: "category",
      label: "Categoria",
      render: (debt) => (
        <span className="text-sm text-[#5a4e7a] min-w-[120px]">
          {debt.category}
        </span>
      ),
    },
    {
      key: "debtType",
      label: "Tipo",
      render: (debt) => (
        <span className="text-sm text-[#2d2060]">
          {debtTypeLabel(debt.debtType)}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: "Valor",
      render: (debt) => (
        <span className="text-sm font-semibold text-[#1a1333]">
          {formatCurrency(debt.totalAmount)}
        </span>
      ),
    },
    {
      key: "installmentCount",
      label: "Parcelas",
      render: (debt) => (
        <span className="text-sm text-[#5a4e7a]">
          {debt.hasInstallments ? debt.installmentCount : "-"}
        </span>
      ),
    },
    {
      key: "paidInstallmentsCount",
      label: "Parcelas pagas",
      render: (debt) => (
        <span className="text-sm text-[#5a4e7a]">
          {debt.hasInstallments ? getPaidInstallmentsCount(debt) : "-"}
        </span>
      ),
    },
    {
      key: "installmentAmount",
      label: "Valor da parcela",
      render: (debt) => (
        <span className="text-sm text-[#5a4e7a]">
          {debt.hasInstallments
            ? formatCurrency(getInstallmentAmount(debt))
            : "-"}
        </span>
      ),
    },
    {
      key: "paidAmount",
      label: "Valor pago",
      render: (debt) => (
        <span className="text-sm text-emerald-700">
          {formatCurrency(getPaidAmount(debt))}
        </span>
      ),
    },
    {
      key: "remainingAmount",
      label: "Valor restante",
      render: (debt) => (
        <span className="text-sm text-[#5a4e7a]">
          {formatCurrency(getRemainingAmount(debt))}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Vencimento",
      render: (debt) => (
        <span className="text-sm text-[#4a3f6b]">
          {formatDate(getNearestDueDate(debt))}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (debt) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusPillStyle(debt.status)}`}
        >
          {debtStatusLabel(debt.status)}
        </span>
      ),
    },
  ];
}
