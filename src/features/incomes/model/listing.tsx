import { Check, Trash2, X } from "lucide-react";
import type { Income } from "@/api/incomes/schema";
import type { DataTableColumn } from "@/components/organisms/DataTable";
import EditIcon from "@/components/atoms/icons/EditIcon";
import Input from "@/components/atoms/Input";
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

export interface IncomeReceiptEditState {
  editingIncomeId: string | null;
  receivedAmount: string;
  receivedAt: string;
  saving: boolean;
  onReceivedAmountChange: (value: string) => void;
  onReceivedAtChange: (value: string) => void;
  onStart: (income: Income) => void;
  onCancel: () => void;
  onConfirm: (income: Income) => void;
}

export function getIncomeTableColumns(actions: {
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
  receipt: IncomeReceiptEditState;
}): DataTableColumn<Income>[] {
  return [
    {
      key: "actions",
      label: "Ações",
      render: (income) => {
        const isEditingReceipt =
          actions.receipt.editingIncomeId === income.idIncome;

        if (isEditingReceipt) {
          return (
            <div className="flex items-center gap-3">
              <button
                type="button"
                title="Confirmar recebimento"
                className="text-emerald-700 transition hover:text-emerald-900 disabled:opacity-50"
                disabled={actions.receipt.saving}
                onClick={(event) => {
                  event.stopPropagation();
                  actions.receipt.onConfirm(income);
                }}
              >
                <Check size={18} />
              </button>
              <button
                type="button"
                title="Cancelar"
                className="text-rose-600 transition hover:text-rose-800 disabled:opacity-50"
                disabled={actions.receipt.saving}
                onClick={(event) => {
                  event.stopPropagation();
                  actions.receipt.onCancel();
                }}
              >
                <X size={18} />
              </button>
            </div>
          );
        }

        return (
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
              title="Registrar recebimento"
              className="text-emerald-700 transition hover:text-emerald-900"
              onClick={(event) => {
                event.stopPropagation();
                actions.receipt.onStart(income);
              }}
            >
              <Check size={18} />
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
        );
      },
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
      render: (income) => {
        if (actions.receipt.editingIncomeId === income.idIncome) {
          return (
            <div className="min-w-[140px]" onClick={(e) => e.stopPropagation()}>
              <Input
                inputMode="decimal"
                value={actions.receipt.receivedAmount}
                onChange={(event) =>
                  actions.receipt.onReceivedAmountChange(event.target.value)
                }
                placeholder="0,00"
              />
            </div>
          );
        }

        return (
          <span className="text-sm text-emerald-700">
            {formatCurrency(income.receivedAmount)}
          </span>
        );
      },
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
      key: "expectedDate",
      label: "Data esperada",
      render: (income) => (
        <span className="text-sm text-[#4a3f6b]">
          {formatDate(income.expectedDate)}
        </span>
      ),
    },
    {
      key: "receivedAt",
      label: "Data de recebimento",
      render: (income) => {
        if (actions.receipt.editingIncomeId === income.idIncome) {
          return (
            <div className="min-w-[160px]" onClick={(e) => e.stopPropagation()}>
              <Input
                type="date"
                value={actions.receipt.receivedAt}
                onChange={(event) =>
                  actions.receipt.onReceivedAtChange(event.target.value)
                }
              />
            </div>
          );
        }

        return (
          <span className="text-sm text-[#4a3f6b]">
            {formatDate(income.receivedAt)}
          </span>
        );
      },
    },
  ];
}
