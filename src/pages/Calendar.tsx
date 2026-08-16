import { useEffect, useMemo, useState } from "react";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/atoms/Loading";
import SectionCard from "@/components/organisms/SectionCard";
import { useBillingContext } from "@/features/billing";
import {
  buildDebtStatementLines,
  currentMonthValue,
  debtStatusLabel,
  fetchDebts,
  formatMonthLabel,
  monthToDueDateRange,
} from "@/features/debts";
import {
  buildIncomeStatementLines,
  fetchIncomes,
  incomeStatusLabel,
} from "@/features/incomes";
import { planRoutePaths } from "@/router";
import { formatDateDisplay } from "@/utils/format";
import { colors } from "@/config";
import { useToast } from "../shared/toast/useToast";

const CALENDAR_PAGE_SIZE = 200;
const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface CalendarEntry {
  id: string;
  kind: "debt" | "income";
  title: string;
  category: string;
  dueDate: string;
  amount: number;
  statusLabel: string;
  settledAt?: string;
}

interface DayCell {
  day: number;
  dateKey: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function toErrorMessage(error: unknown): string | undefined {
  return error instanceof Error && error.message ? error.message : undefined;
}

function buildMonthCells(monthValue: string): (DayCell | null)[] {
  const [yearStr, monthStr] = monthValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const cells: (DayCell | null)[] = Array.from(
    { length: firstWeekday },
    () => null,
  );

  for (let day = 1; day <= lastDay; day += 1) {
    cells.push({
      day,
      dateKey: `${yearStr}-${monthStr}-${String(day).padStart(2, "0")}`,
    });
  }

  return cells;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { subscription, isLoading: isSubscriptionLoading } =
    useBillingContext();
  const { showError } = useToast();

  const [month, setMonth] = useState(currentMonthValue);
  const [loading, setLoading] = useState(false);
  const [entriesByDay, setEntriesByDay] = useState<
    Map<string, CalendarEntry[]>
  >(new Map());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const isPro = subscription?.plan === "PRO";
  const cells = useMemo(() => buildMonthCells(month), [month]);
  const monthLabel = useMemo(() => formatMonthLabel(month), [month]);

  async function loadMonth() {
    const { dueDateFrom, dueDateTo } = monthToDueDateRange(month);
    setLoading(true);
    setSelectedDay(null);

    try {
      const [debtsResult, incomesResult] = await Promise.all([
        fetchDebts({
          page: 1,
          limit: CALENDAR_PAGE_SIZE,
          dueDateFrom,
          dueDateTo,
        }),
        fetchIncomes({
          page: 1,
          limit: CALENDAR_PAGE_SIZE,
          dueDateFrom,
          dueDateTo,
        }),
      ]);

      const entries: CalendarEntry[] = [];

      for (const line of buildDebtStatementLines(
        debtsResult.items,
        dueDateFrom,
        dueDateTo,
      )) {
        entries.push({
          id: `debt-${line.idDebtInstallment ?? line.idDebt}`,
          kind: "debt",
          title: line.title,
          category: line.category,
          dueDate: line.dueDate,
          amount: line.amountDue,
          statusLabel: debtStatusLabel(line.status),
          settledAt: line.paidAt,
        });
      }

      for (const line of buildIncomeStatementLines(
        incomesResult.items,
        dueDateFrom,
        dueDateTo,
      )) {
        entries.push({
          id: `income-${line.idIncomeInstallment ?? line.idIncome}`,
          kind: "income",
          title: line.title,
          category: line.category,
          dueDate: line.dueDate,
          amount: line.amountDue,
          statusLabel: incomeStatusLabel(line.status),
          settledAt: line.receivedAt,
        });
      }

      const grouped = new Map<string, CalendarEntry[]>();
      for (const entry of entries) {
        const dayEntries = grouped.get(entry.dueDate) ?? [];
        dayEntries.push(entry);
        grouped.set(entry.dueDate, dayEntries);
      }

      setEntriesByDay(grouped);
    } catch (error) {
      showError("Falha ao carregar o calendário", toErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isPro) {
      void loadMonth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, isPro]);

  if (isSubscriptionLoading) {
    return (
      <div className="flex h-56 items-center justify-center">
        <Loading label="Carregando..." />
      </div>
    );
  }

  if (!isPro) {
    return (
      <SectionCard
        title="Calendário financeiro"
        description="Veja de uma vez só tudo que vence em cada dia do mês."
      >
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
              color: "#fff",
            }}
          >
            <Crown size={26} />
          </div>
          <p
            className="max-w-md text-sm leading-relaxed"
            style={{ color: colors.brown[500] }}
          >
            O calendário financeiro é um recurso exclusivo do Vaulto Pro.
            Visualize dívidas e receitas organizadas por dia de vencimento, para
            nunca ser pego de surpresa.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate(planRoutePaths.list)}
          >
            Assinar Vaulto Pro
          </Button>
        </div>
      </SectionCard>
    );
  }

  const selectedEntries = selectedDay
    ? (entriesByDay.get(selectedDay) ?? [])
    : [];

  return (
    <div className="space-y-6">
      <SectionCard
        title="Calendário financeiro"
        description="Dívidas e receitas organizadas por dia de vencimento."
      >
        <div className="max-w-xs">
          <Input
            label="Mês de referência"
            type="month"
            value={month}
            onChange={(event) =>
              setMonth(event.target.value || currentMonthValue())
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title={monthLabel}
        description="Toque em um dia para ver os detalhes."
      >
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <Loading label="Carregando..." />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="pb-1 text-center text-xs font-semibold uppercase tracking-wide"
                style={{ color: colors.brown[500] }}
              >
                {label}
              </div>
            ))}

            {cells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} />;
              }

              const dayEntries = entriesByDay.get(cell.dateKey) ?? [];
              const debtTotal = dayEntries
                .filter((entry) => entry.kind === "debt")
                .reduce((sum, entry) => sum + entry.amount, 0);
              const incomeTotal = dayEntries
                .filter((entry) => entry.kind === "income")
                .reduce((sum, entry) => sum + entry.amount, 0);
              const isSelected = selectedDay === cell.dateKey;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() =>
                    setSelectedDay(isSelected ? null : cell.dateKey)
                  }
                  className="flex min-h-[64px] flex-col items-start rounded-lg border p-1.5 text-left transition-colors sm:min-h-[80px] sm:p-2"
                  style={{
                    borderColor: isSelected ? colors.purple[700] : "#3a2f5e",
                    background: isSelected ? colors.purple[700] : "#141225",
                  }}
                >
                  <span className="text-xs font-semibold text-[#f7f5ff]">
                    {cell.day}
                  </span>
                  {debtTotal > 0 && (
                    <span
                      className="mt-1 truncate text-[10px] font-semibold sm:text-xs"
                      style={{ color: "#f87171" }}
                    >
                      − {formatCurrency(debtTotal)}
                    </span>
                  )}
                  {incomeTotal > 0 && (
                    <span className="truncate text-[10px] font-semibold text-emerald-300 sm:text-xs">
                      + {formatCurrency(incomeTotal)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      {selectedDay && (
        <SectionCard
          title={`Detalhes de ${formatDateDisplay(selectedDay)}`}
          description="Lançamentos com vencimento nesse dia."
        >
          {selectedEntries.length === 0 ? (
            <p className="text-sm" style={{ color: colors.brown[500] }}>
              Nenhum lançamento nesse dia.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-[#3a2f5e] bg-[#141225] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#f7f5ff]">
                      {entry.title}
                    </p>
                    <p className="text-xs text-[#b7afcf]">
                      {entry.kind === "debt" ? "Dívida" : "Receita"} ·{" "}
                      {entry.category} · {entry.statusLabel}
                    </p>
                    {entry.settledAt && (
                      <p className="mt-0.5 text-xs text-[#b7afcf]">
                        {entry.kind === "debt" ? "Pago em " : "Recebido em "}
                        {formatDateDisplay(entry.settledAt)}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: entry.kind === "debt" ? "#f87171" : "#6ee7b7",
                    }}
                  >
                    {entry.kind === "debt" ? "− " : "+ "}
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
