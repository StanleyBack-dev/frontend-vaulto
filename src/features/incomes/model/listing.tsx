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

function getBalance(income: Income): number {
  return Math.max(income.expectedAmount - income.receivedAmount, 0);
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
      key: "expectedAmount",
      label: "Valor esperado",
      render: (income) => (
        <span className="text-sm font-semibold text-[#1a1333]">
          {formatCurrency(income.expectedAmount)}
        </span>
      ),
    },
    {
      key: "receivedAmount",
      label: "Valor recebido",
      render: (income) => (
        <span className="text-sm text-emerald-700">
          {formatCurrency(income.receivedAmount)}
        </span>
      ),
    },
    {
      key: "balance",
      label: "Saldo",
      render: (income) => (
        <span className="text-sm text-[#5a4e7a]">
          {formatCurrency(getBalance(income))}
        </span>
      ),
    },
    {
      key: "expectedDate",
      label: "Vencimento",
      render: (income) => (
        <span className="text-sm text-[#4a3f6b]">
          {formatDate(income.expectedDate)}
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
  ];
}
