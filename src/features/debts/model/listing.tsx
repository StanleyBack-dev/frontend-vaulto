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

function getPaidAmount(debt: Debt): number {
  return debt.payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
}

function getRemainingAmount(debt: Debt): number {
  return Math.max(debt.totalAmount - getPaidAmount(debt), 0);
}

function getInstallmentAmount(debt: Debt): number {
  if (debt.installments[0]) {
    return debt.installments[0].amountDue;
  }

  const installmentCount = debt.installmentCount ?? 0;

  return installmentCount > 0 ? debt.totalAmount / installmentCount : 0;
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
}): DataTableColumn<Debt>[] {
  return [
    {
      key: "actions",
      label: "Ações",
      render: (debt) => (
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
          {formatDate(debt.dueDate)}
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
