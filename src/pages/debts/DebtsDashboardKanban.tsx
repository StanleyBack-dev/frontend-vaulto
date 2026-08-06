import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Clock, CheckCircle2, CircleDot } from "lucide-react";
import type { Debt } from "@/api/debts/schema";
import type { Income } from "@/api/incomes/schema";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import { colors } from "@/config";
import { debtRoutePaths } from "@/router";
import {
  currentMonthValue,
  debtStatusLabel,
  debtTypeOptions,
  formatMonthLabel,
  getNearestDueDate,
  monthToDueDateRange,
  useDebtsContext,
} from "@/features/debts";
import { fetchIncomes } from "@/features/incomes";
import {
  fetchDebtsReport,
  reportUiCopy,
  type DebtsReport,
} from "@/features/reports";
import { useToast } from "@/shared/toast/useToast";
import { formatDateDisplay } from "@/utils/format";

const DASHBOARD_PAGE_SIZE = 100;
// Caps how many cards render per column before "Ver mais" reveals another
// page in place — without this, a status with dozens of debts would make its
// column (and the internal scroll area) unreasonably long right away.
const DASHBOARD_CARD_LIMIT = 8;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(value?: string | null): string {
  return formatDateDisplay(value ?? undefined) || "-";
}

// Both Debt and Income installments can span several different months. The
// board (and its totals) must only reflect the slice of a record whose
// installments are actually due within the month currently being viewed —
// otherwise an installment settled in a different month would leak into the
// figures shown for the month being displayed.
function getInstallmentsDueInRange<T extends { dueDate: string }>(
  installments: T[],
  dueDateFrom?: string,
  dueDateTo?: string,
): T[] {
  if (!dueDateFrom && !dueDateTo) {
    return installments;
  }

  const from = dueDateFrom ? new Date(dueDateFrom).getTime() : undefined;
  const to = dueDateTo ? new Date(dueDateTo).getTime() : undefined;

  return installments.filter((installment) => {
    const due = new Date(installment.dueDate).getTime();
    if (from !== undefined && due < from) return false;
    if (to !== undefined && due > to) return false;
    return true;
  });
}

function getIncomeReceivedAmount(
  income: Income,
  dueDateFrom?: string,
  dueDateTo?: string,
): number {
  return getInstallmentsDueInRange(
    income.installments,
    dueDateFrom,
    dueDateTo,
  ).reduce((sum, installment) => sum + installment.amountReceived, 0);
}

const COLUMNS: {
  status: Debt["status"];
  label: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  {
    status: "OPEN",
    label: "Em aberto",
    color: "#7c3aed",
    icon: <CircleDot size={15} />,
  },
  {
    status: "OVERDUE",
    label: "Vencidas",
    color: "#f43f5e",
    icon: <AlertCircle size={15} />,
  },
  {
    status: "PARTIALLY_PAID",
    label: "Parc. pagas",
    color: "#f59e0b",
    icon: <Clock size={15} />,
  },
  {
    status: "PAID",
    label: "Pagas",
    color: "#10b981",
    icon: <CheckCircle2 size={15} />,
  },
];

interface DebtCardProps {
  debt: Debt;
  onEdit: () => void;
}

function DebtCard({ debt, onEdit }: DebtCardProps) {
  const paidAmount = debt.payments.reduce((s, p) => s + p.amountPaid, 0);
  const remaining = Math.max(debt.totalAmount - paidAmount, 0);
  const progress =
    debt.totalAmount > 0
      ? Math.min((paidAmount / debt.totalAmount) * 100, 100)
      : 0;

  return (
    <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4 space-y-3 hover:border-[#5b4a9e] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#f7f5ff] truncate">
            {debt.title}
          </p>
          <p className="text-xs text-[#b7afcf] mt-0.5">{debt.category}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 rounded border border-[#3a2f5e] px-2 py-1 text-xs text-[#c5bbeb] hover:bg-[#1f1832] transition-colors"
        >
          Editar
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-[#b7afcf]">
        <span>Vence: {formatDate(getNearestDueDate(debt))}</span>
        <span className="text-[#d7cfff] font-medium">
          {formatCurrency(debt.totalAmount)}
        </span>
      </div>

      {debt.hasInstallments && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#b7afcf]">
            <span>Pago: {formatCurrency(paidAmount)}</span>
            <span>Restante: {formatCurrency(remaining)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#1e1830]">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-[#7B3FF2] to-[#D4AF37] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="text-xs text-[#8b7fac]">{debt.description || " "}</div>
    </div>
  );
}

export default function DebtsDashboardKanban() {
  const navigate = useNavigate();
  const { debts, debtCategories, loading, setFilters, setLimit } =
    useDebtsContext();
  const { showError } = useToast();

  const [month, setMonth] = useState(currentMonthValue);
  const [viewAllTime, setViewAllTime] = useState(false);
  const { dueDateFrom, dueDateTo } = useMemo(
    () =>
      viewAllTime
        ? { dueDateFrom: undefined, dueDateTo: undefined }
        : monthToDueDateRange(month),
    [viewAllTime, month],
  );

  const [report, setReport] = useState<DebtsReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [incomesLoading, setIncomesLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debtType, setDebtType] = useState("");
  const [idCategory, setIdCategory] = useState("");
  const [visibleCounts, setVisibleCounts] = useState<
    Record<Debt["status"], number>
  >({} as Record<Debt["status"], number>);

  useEffect(() => {
    void setLimit(DASHBOARD_PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void setFilters({ dueDateFrom, dueDateTo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueDateFrom, dueDateTo]);

  useEffect(() => {
    let cancelled = false;
    setIncomesLoading(true);

    fetchIncomes({
      page: 1,
      limit: DASHBOARD_PAGE_SIZE,
      dueDateFrom,
      dueDateTo,
    })
      .then((data) => {
        if (!cancelled) {
          setIncomes(data.items);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          showError(
            "Falha ao carregar receitas",
            error instanceof Error ? error.message : undefined,
          );
          setIncomes([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIncomesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dueDateFrom, dueDateTo, showError]);

  useEffect(() => {
    let cancelled = false;
    setReportLoading(true);

    fetchDebtsReport({
      dueDateFrom,
      dueDateTo,
      debtType: debtType || undefined,
      idCategory: idCategory || undefined,
    })
      .then((data) => {
        if (!cancelled) {
          setReport(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          showError(
            reportUiCopy.errors.loadReportFallback,
            error instanceof Error ? error.message : undefined,
          );
          setReport(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReportLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dueDateFrom, dueDateTo, debtType, idCategory, showError]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return debts.filter((d) => {
      const matchesType = !debtType || d.debtType === debtType;
      const matchesCategory = !idCategory || d.idCategory === idCategory;
      const matchesSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (d.description || "").toLowerCase().includes(q);
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [debts, search, debtType, idCategory]);

  const grouped = useMemo(() => {
    const map = new Map<Debt["status"], Debt[]>();
    for (const col of COLUMNS) map.set(col.status, []);
    for (const d of filtered) {
      const list = map.get(d.status);
      if (list) list.push(d);
    }
    return map;
  }, [filtered]);

  useEffect(() => {
    setVisibleCounts({} as Record<Debt["status"], number>);
  }, [filtered]);

  const totals = {
    total: report?.totalAmountDue ?? 0,
    paid: report?.totalAmountPaid ?? 0,
    outstanding: report?.totalOutstanding ?? 0,
    open: report?.countByStatus.open ?? 0,
    overdue: report?.countByStatus.overdue ?? 0,
  };

  // Balance always reflects money that actually moved — received income
  // against paid debts — never the merely expected/due amounts, since
  // "esperado"/"devido" haven't happened yet and would distort the real
  // cash position for the month.
  const incomeReceivedTotal = incomes.reduce(
    (sum, income) =>
      sum + getIncomeReceivedAmount(income, dueDateFrom, dueDateTo),
    0,
  );
  const incomeDueTotal = incomes.reduce(
    (sum, income) =>
      sum +
      getInstallmentsDueInRange(
        income.installments,
        dueDateFrom,
        dueDateTo,
      ).reduce((s, installment) => s + installment.amountDue, 0),
    0,
  );
  const incomeReceivableTotal = Math.max(
    incomeDueTotal - incomeReceivedTotal,
    0,
  );
  const monthBalance = incomeReceivedTotal - totals.paid;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#f7f5ff]">
          Dashboard de Dívidas
        </h2>
        <p className="text-sm text-[#b7afcf]">
          {viewAllTime
            ? "Todos os vencimentos, de qualquer período"
            : `Vencimentos de ${formatMonthLabel(month)}`}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
          <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
            Total
          </p>
          <p className="mt-1 text-lg font-bold text-[#f7f5ff]">
            {reportLoading ? "..." : formatCurrency(totals.total)}
          </p>
        </div>
        <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
          <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
            Quitado
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-300">
            {reportLoading ? "..." : formatCurrency(totals.paid)}
          </p>
        </div>
        <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
          <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
            Devido
          </p>
          <p className="mt-1 text-lg font-bold text-amber-300">
            {reportLoading ? "..." : formatCurrency(totals.outstanding)}
          </p>
        </div>
        <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
          <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
            Em aberto
          </p>
          <p className="mt-1 text-lg font-bold text-violet-300">
            {reportLoading ? "..." : totals.open}
          </p>
        </div>
        <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
          <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
            Vencidas
          </p>
          <p className="mt-1 text-lg font-bold text-rose-300">
            {reportLoading ? "..." : totals.overdue}
          </p>
        </div>
      </div>

      {/* Saldo do mes: receitas recebidas x dividas quitadas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
          <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
            Receitas recebidas
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-300">
            {incomesLoading ? "..." : formatCurrency(incomeReceivedTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
          <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
            Receitas a receber
          </p>
          <p className="mt-1 text-lg font-bold text-violet-300">
            {incomesLoading ? "..." : formatCurrency(incomeReceivableTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
          <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
            Dívidas quitadas
          </p>
          <p className="mt-1 text-lg font-bold text-amber-300">
            {reportLoading ? "..." : formatCurrency(totals.paid)}
          </p>
        </div>
        <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
          <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
            Saldo
          </p>
          <p
            className="mt-1 text-lg font-bold"
            style={{ color: monthBalance >= 0 ? "#6ee7b7" : "#fda4af" }}
          >
            {incomesLoading || reportLoading
              ? "..."
              : formatCurrency(monthBalance)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[#3a2f5e] bg-[#141225] p-3">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-[#3a2f5e] bg-[#0e0c1e] px-3 py-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, categoria..."
            className="flex-1 bg-transparent text-sm text-[#f7f5ff] placeholder:text-[#6b6080] outline-none"
          />
        </div>
        <div className="min-w-[160px]">
          <Input
            label="Mês de referência"
            type="month"
            value={month}
            disabled={viewAllTime}
            onChange={(e) => setMonth(e.target.value || currentMonthValue())}
          />
        </div>
        <div className="min-w-[160px]">
          <Select
            label="Tipo"
            value={debtType}
            onChange={(e) => setDebtType(e.target.value)}
          >
            <option value="">Todos</option>
            {debtTypeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[160px]">
          <Select
            label="Categoria"
            value={idCategory}
            onChange={(e) => setIdCategory(e.target.value)}
          >
            <option value="">Todas</option>
            {debtCategories.map((c) => (
              <option key={c.idCategory} value={c.idCategory}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="button"
          onClick={() => setViewAllTime((prev) => !prev)}
          className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
            viewAllTime
              ? "border-violet-300 bg-violet-100 text-violet-800"
              : "border-[#2A2042] bg-white text-[#1a1333] hover:bg-gray-50"
          }`}
        >
          Todo o período
        </button>
        {(search ||
          debtType ||
          idCategory ||
          viewAllTime ||
          month !== currentMonthValue()) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setDebtType("");
              setIdCategory("");
              setMonth(currentMonthValue());
              setViewAllTime(false);
            }}
            className="rounded border border-[#3a2f5e] px-3 py-2 text-sm text-[#c5bbeb] hover:bg-[#1f1832]"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div
            className="w-9 h-9 rounded-full border-2 animate-spin"
            style={{
              borderColor: colors.gold[500],
              borderTopColor: "transparent",
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const cards = grouped.get(col.status) ?? [];
            const columnTotal = cards.reduce((s, d) => s + d.totalAmount, 0);
            const visibleCount =
              visibleCounts[col.status] ?? DASHBOARD_CARD_LIMIT;
            const remaining = cards.length - visibleCount;

            return (
              <div key={col.status} className="flex flex-col gap-3">
                {/* Column header */}
                <div
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{
                    background: `${col.color}22`,
                    border: `1px solid ${col.color}44`,
                  }}
                >
                  <div
                    className="flex items-center gap-2"
                    style={{ color: col.color }}
                  >
                    {col.icon}
                    <span className="text-sm font-semibold">{col.label}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{ background: `${col.color}33`, color: col.color }}
                    >
                      {cards.length}
                    </span>
                    <p className="text-xs text-[#b7afcf] mt-0.5">
                      {formatCurrency(columnTotal)}
                    </p>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex min-h-[120px] max-h-[480px] flex-col gap-2 overflow-y-auto pr-1">
                  {cards.length === 0 ? (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-[#3a2f5e] py-8">
                      <p className="text-xs text-[#6b6080]">Nenhuma dívida</p>
                    </div>
                  ) : (
                    <>
                      {cards.slice(0, visibleCount).map((debt) => (
                        <DebtCard
                          key={debt.idDebt}
                          debt={debt}
                          onEdit={() =>
                            navigate(debtRoutePaths.edit(debt.idDebt))
                          }
                        />
                      ))}
                      {remaining > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleCounts((current) => ({
                              ...current,
                              [col.status]: visibleCount + DASHBOARD_CARD_LIMIT,
                            }))
                          }
                          className="shrink-0 rounded-lg border border-dashed px-3 py-2.5 text-xs font-semibold transition-colors hover:bg-[#1f1832]"
                          style={{ borderColor: col.color, color: col.color }}
                        >
                          Ver mais {Math.min(remaining, DASHBOARD_CARD_LIMIT)} (
                          {remaining} restantes)
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legenda de status */}
      <div className="flex flex-wrap gap-3 pt-2">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            className="flex items-center gap-1.5 text-xs text-[#b7afcf]"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: col.color }}
            />
            {debtStatusLabel(col.status)}
          </div>
        ))}
      </div>
    </div>
  );
}
