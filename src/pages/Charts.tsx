import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  HandCoins,
  Wallet,
} from "lucide-react";
import SectionCard from "@/components/organisms/SectionCard";
import Input from "@atoms/Input";
import Select from "@atoms/Select";
import Button from "@atoms/Button";
import Loading from "@atoms/Loading";
import StatCard from "@molecules/StatCard";
import StatusStackedBar, {
  type StatusStackedBarSegment,
} from "@molecules/StatusStackedBar";
import CategoryAmountBarList from "@molecules/CategoryAmountBarList";
import MonthlyCashflowChart, {
  type MonthlyCashflowChartMode,
} from "@molecules/MonthlyCashflowChart";
import {
  fetchDebtsAmountByCategory,
  fetchDebtsReport,
  fetchIncomesAmountByCategory,
  fetchIncomesReport,
  fetchMonthlyCashflowTrend,
  type CategoryAmountRow,
  type DebtsReport,
  type IncomesReport,
  type MonthlyCashflowPoint,
} from "@/features/reports";
import {
  currentMonthValue,
  formatMonthLabel,
  monthToDueDateRange,
} from "@/features/debts";
import { useBillingContext } from "@/features/billing";
import { useToast } from "@/shared/toast/useToast";
import { colors } from "@/config";
import { debtRoutePaths, incomeRoutePaths, planRoutePaths } from "@/router";

type TrendPeriod = "3" | "6" | "12" | "THIS_YEAR" | "LAST_YEAR" | "CUSTOM_YEAR";

const TREND_PERIOD_OPTIONS: { value: TrendPeriod; label: string }[] = [
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Últimos 12 meses" },
  { value: "THIS_YEAR", label: "Este ano" },
  { value: "LAST_YEAR", label: "Ano anterior" },
  { value: "CUSTOM_YEAR", label: "Escolher ano" },
];

const TREND_MODE_OPTIONS: { value: MonthlyCashflowChartMode; label: string }[] =
  [
    { value: "combined", label: "Combinado" },
    { value: "expenses", label: "Dívidas" },
    { value: "income", label: "Receitas" },
  ];

// Same four colors as the Dashboard's own stat cards (Quitado/Devido/Em
// aberto/Vencidas) — emerald/amber/violet/rose-300 — so a status means the
// same thing everywhere in the app, not a chart-specific palette.
const STATUS_COLORS = {
  good: "#6ee7b7",
  warning: "#fcd34d",
  neutral: "#c4b5fd",
  critical: "#fda4af",
};

const OUTLINE_ON_LIGHT = "!border-gray-400 !text-gray-700 hover:!bg-gray-100";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function trendDateRange(
  period: TrendPeriod,
  customYear: number,
): { dueDateFrom: string; dueDateTo: string } {
  const now = new Date();

  if (
    period === "THIS_YEAR" ||
    period === "LAST_YEAR" ||
    period === "CUSTOM_YEAR"
  ) {
    const year =
      period === "THIS_YEAR"
        ? now.getFullYear()
        : period === "LAST_YEAR"
          ? now.getFullYear() - 1
          : customYear;

    return { dueDateFrom: `${year}-01-01`, dueDateTo: `${year}-12-31` };
  }

  const monthsBack = Number(period);
  const from = new Date(
    now.getFullYear(),
    now.getMonth() - (monthsBack - 1),
    1,
  );
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    dueDateFrom: `${from.getFullYear()}-${pad2(from.getMonth() + 1)}-01`,
    dueDateTo: `${to.getFullYear()}-${pad2(to.getMonth() + 1)}-${pad2(to.getDate())}`,
  };
}

function trendPeriodLabel(period: TrendPeriod, customYear: number): string {
  if (period === "THIS_YEAR") return `em ${new Date().getFullYear()}`;
  if (period === "LAST_YEAR") return `em ${new Date().getFullYear() - 1}`;
  if (period === "CUSTOM_YEAR") return `em ${customYear}`;
  return `nos últimos ${period} meses`;
}

function buildDebtSegments(
  report: DebtsReport | null,
): StatusStackedBarSegment[] {
  if (!report) return [];

  return [
    {
      key: "paid",
      label: "Pagas",
      count: report.countByStatus.paid,
      color: STATUS_COLORS.good,
    },
    {
      key: "partiallyPaid",
      label: "Parcialmente pagas",
      count: report.countByStatus.partiallyPaid,
      color: STATUS_COLORS.warning,
    },
    {
      key: "open",
      label: "Em aberto",
      count: report.countByStatus.open,
      color: STATUS_COLORS.neutral,
    },
    {
      key: "overdue",
      label: "Vencidas",
      count: report.countByStatus.overdue,
      color: STATUS_COLORS.critical,
    },
  ];
}

function buildIncomeSegments(
  report: IncomesReport | null,
): StatusStackedBarSegment[] {
  if (!report) return [];

  return [
    {
      key: "received",
      label: "Recebidas",
      count: report.countByStatus.received,
      color: STATUS_COLORS.good,
    },
    {
      key: "partiallyReceived",
      label: "Parcialmente recebidas",
      count: report.countByStatus.partiallyReceived,
      color: STATUS_COLORS.warning,
    },
    {
      key: "pending",
      label: "Pendentes",
      count: report.countByStatus.pending,
      color: STATUS_COLORS.neutral,
    },
    {
      key: "overdue",
      label: "Vencidas",
      count: report.countByStatus.overdue,
      color: STATUS_COLORS.critical,
    },
  ];
}

export default function Charts() {
  const navigate = useNavigate();
  const { showError } = useToast();
  const { isPro, isLoading: isSubscriptionLoading } = useBillingContext();

  const [month, setMonth] = useState(currentMonthValue);
  const [debtsReport, setDebtsReport] = useState<DebtsReport | null>(null);
  const [incomesReport, setIncomesReport] = useState<IncomesReport | null>(
    null,
  );
  const [debtsByCategory, setDebtsByCategory] = useState<CategoryAmountRow[]>(
    [],
  );
  const [incomesByCategory, setIncomesByCategory] = useState<
    CategoryAmountRow[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("6");
  const [trendMode, setTrendMode] =
    useState<MonthlyCashflowChartMode>("combined");
  const [customYear, setCustomYear] = useState(() => new Date().getFullYear());
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyCashflowPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(isPro);

  useEffect(() => {
    if (!isPro) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const { dueDateFrom, dueDateTo } = monthToDueDateRange(month);

    Promise.all([
      fetchDebtsReport({ dueDateFrom, dueDateTo }),
      fetchIncomesReport({ dueDateFrom, dueDateTo }),
      fetchDebtsAmountByCategory({ dueDateFrom, dueDateTo }),
      fetchIncomesAmountByCategory({ dueDateFrom, dueDateTo }),
    ])
      .then(([debts, incomes, debtsCategories, incomesCategories]) => {
        if (cancelled) return;
        setDebtsReport(debts);
        setIncomesReport(incomes);
        setDebtsByCategory(debtsCategories);
        setIncomesByCategory(incomesCategories);
      })
      .catch((error) => {
        if (cancelled) return;
        showError(
          "Não foi possível carregar os gráficos",
          error instanceof Error ? error.message : undefined,
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isPro, month, showError]);

  useEffect(() => {
    if (!isPro) return;

    let cancelled = false;
    setTrendLoading(true);

    fetchMonthlyCashflowTrend(trendDateRange(trendPeriod, customYear))
      .then((points) => {
        if (!cancelled) setMonthlyTrend(points);
      })
      .catch((error) => {
        if (cancelled) return;
        showError(
          "Não foi possível carregar a evolução mensal",
          error instanceof Error ? error.message : undefined,
        );
      })
      .finally(() => {
        if (!cancelled) setTrendLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isPro, trendPeriod, customYear, showError]);

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
        title="Gráficos"
        description="Visão geral das suas dívidas e receitas."
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
            Os gráficos são um recurso exclusivo do Vaulto Pro: dívidas e
            receitas por status, por categoria, e a evolução mensal do seu saldo
            — tudo num só lugar.
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

  const totalPaid = debtsReport?.totalAmountPaid ?? 0;
  const totalReceived = incomesReport?.totalAmountReceived ?? 0;
  const monthBalance = totalReceived - totalPaid;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Gráficos"
        description={`Visão geral de ${formatMonthLabel(month)}.`}
        action={
          <Input
            type="month"
            value={month}
            onChange={(event) =>
              setMonth(event.target.value || currentMonthValue())
            }
            aria-label="Selecionar mês"
            wrapperClassName="w-full sm:w-auto"
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Pago no mês"
            value={loading ? "—" : formatCurrency(totalPaid)}
            valueColor={STATUS_COLORS.good}
            sub={
              debtsReport
                ? `${debtsReport.countByStatus.paid} parcela(s) quitadas`
                : undefined
            }
            tone="dark"
          />
          <StatCard
            icon={<HandCoins size={20} />}
            label="Recebido no mês"
            value={loading ? "—" : formatCurrency(totalReceived)}
            valueColor={STATUS_COLORS.good}
            sub={
              incomesReport
                ? `${incomesReport.countByStatus.received} parcela(s) recebidas`
                : undefined
            }
            tone="dark"
          />
          <StatCard
            icon={<Wallet size={20} />}
            label="Saldo do mês"
            value={loading ? "—" : formatCurrency(monthBalance)}
            valueColor={
              monthBalance >= 0 ? STATUS_COLORS.good : STATUS_COLORS.critical
            }
            sub={
              monthBalance >= 0
                ? "Recebido supera o pago"
                : "Pago supera o recebido"
            }
            tone="dark"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Evolução mensal"
        description={`Dívidas, receitas e saldo pagos/recebidos ${trendPeriodLabel(trendPeriod, customYear)}.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={trendPeriod}
              onChange={(event) =>
                setTrendPeriod(event.target.value as TrendPeriod)
              }
              aria-label="Período da evolução mensal"
              wrapperClassName="w-full sm:w-auto"
            >
              {TREND_PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {trendPeriod === "CUSTOM_YEAR" && (
              <Input
                type="number"
                inputMode="numeric"
                value={String(customYear)}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  setCustomYear(
                    event.target.value && Number.isFinite(parsed)
                      ? parsed
                      : new Date().getFullYear(),
                  );
                }}
                aria-label="Ano"
                wrapperClassName="w-24"
              />
            )}
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {TREND_MODE_OPTIONS.map((option) => {
            const isActive = option.value === trendMode;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTrendMode(option.value)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  background: isActive ? colors.purple[500] : "transparent",
                  color: isActive ? "#ffffff" : colors.brown[500],
                  border: `1px solid ${isActive ? colors.purple[500] : colors.brown[100]}`,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {trendLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loading label="Carregando..." />
          </div>
        ) : (
          <MonthlyCashflowChart points={monthlyTrend} mode={trendMode} />
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Dívidas"
          description="Status e categorias no período."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={OUTLINE_ON_LIGHT}
              rightIcon={<ArrowRight size={14} />}
              onClick={() => navigate(debtRoutePaths.list)}
            >
              Ver dívidas
            </Button>
          }
        >
          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <Loading label="Carregando..." />
            </div>
          ) : (
            <div className="space-y-5">
              <StatusStackedBar
                segments={buildDebtSegments(debtsReport)}
                emptyMessage="Nenhuma dívida com vencimento neste período."
              />
              <div
                className="border-t pt-5"
                style={{ borderColor: colors.brown[100] }}
              >
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: colors.brown[500] }}
                >
                  Por categoria
                </p>
                <CategoryAmountBarList
                  rows={debtsByCategory}
                  color={colors.purple[500]}
                  emptyMessage="Nenhuma dívida com vencimento neste período."
                />
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Receitas"
          description="Status e categorias no período."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={OUTLINE_ON_LIGHT}
              rightIcon={<ArrowRight size={14} />}
              onClick={() => navigate(incomeRoutePaths.list)}
            >
              Ver receitas
            </Button>
          }
        >
          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <Loading label="Carregando..." />
            </div>
          ) : (
            <div className="space-y-5">
              <StatusStackedBar
                segments={buildIncomeSegments(incomesReport)}
                emptyMessage="Nenhuma receita com vencimento neste período."
              />
              <div
                className="border-t pt-5"
                style={{ borderColor: colors.brown[100] }}
              >
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: colors.brown[500] }}
                >
                  Por categoria
                </p>
                <CategoryAmountBarList
                  rows={incomesByCategory}
                  color={colors.gold[500]}
                  emptyMessage="Nenhuma receita com vencimento neste período."
                />
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
