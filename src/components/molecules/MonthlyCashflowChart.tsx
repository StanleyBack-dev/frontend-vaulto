import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { colors, typography } from "../../config";
import type { MonthlyCashflowPoint } from "@/features/reports";

export type MonthlyCashflowChartMode = "combined" | "expenses" | "income";

interface MonthlyCashflowChartProps {
  points: MonthlyCashflowPoint[];
  mode?: MonthlyCashflowChartMode;
}

// Same emerald/rose pair the rest of the app already uses for "good"/
// "critical" values (Dashboard's own stat cards, StatusStackedBar) — kept
// here so despesa/receita read with the same meaning everywhere on the
// page, not a chart-specific palette.
const SERIES_COLORS = {
  income: "#6ee7b7",
  expenses: "#fda4af",
  balance: colors.gold[500],
};

const SERIES_META: Record<
  "income" | "expenses" | "balance",
  { label: string; color: string }
> = {
  income: { label: "Receita", color: SERIES_COLORS.income },
  expenses: { label: "Despesa", color: SERIES_COLORS.expenses },
  balance: { label: "Saldo", color: SERIES_COLORS.balance },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatMonthShort(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  if (!year || !monthNum) return month;

  const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(
    new Date(year, monthNum - 1, 1),
  );
  return `${label.replace(".", "")}/${String(year).slice(2)}`;
}

function CashflowTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-xl border px-4 py-3 shadow-lg"
      style={{
        background: "#141225",
        borderColor: "#3a2f5e",
        fontFamily: typography.fontFamily,
      }}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#b7afcf]">
        {formatMonthShort(String(label))}
      </p>
      <div className="space-y-1 text-sm">
        {payload.map((entry) => {
          const meta = SERIES_META[entry.dataKey as keyof typeof SERIES_META];
          if (!meta) return null;
          const isBalance = entry.dataKey === "balance";

          return (
            <div
              key={String(entry.dataKey)}
              className={`flex items-center justify-between gap-6 ${
                isBalance ? "border-t pt-1" : ""
              }`}
              style={isBalance ? { borderColor: "#3a2f5e" } : undefined}
            >
              <span
                className="flex items-center gap-1.5"
                style={{
                  color: isBalance ? meta.color : "#b7afcf",
                  fontWeight: isBalance ? 600 : 400,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: meta.color }}
                />
                {meta.label}
              </span>
              <span
                className="font-semibold"
                style={{ color: isBalance ? meta.color : "#f7f5ff" }}
              >
                {formatCurrency(Number(entry.value ?? 0))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ seriesKeys }: { seriesKeys: (keyof typeof SERIES_META)[] }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-4">
      {seriesKeys.map((key) => {
        const meta = SERIES_META[key];
        return (
          <span
            key={key}
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{
              color: colors.brown[500],
              fontFamily: typography.fontFamily,
            }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: meta.color }}
            />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

export default function MonthlyCashflowChart({
  points,
  mode = "combined",
}: MonthlyCashflowChartProps) {
  if (points.every((point) => point.expenses === 0 && point.income === 0)) {
    return (
      <p className="text-sm" style={{ color: colors.brown[500] }}>
        Sem movimentação no período selecionado.
      </p>
    );
  }

  const showIncome = mode === "combined" || mode === "income";
  const showExpenses = mode === "combined" || mode === "expenses";
  const showBalance = mode === "combined";
  const seriesKeys: (keyof typeof SERIES_META)[] = [
    ...(showIncome ? (["income"] as const) : []),
    ...(showExpenses ? (["expenses"] as const) : []),
    ...(showBalance ? (["balance"] as const) : []),
  ];

  return (
    <div>
      <Legend seriesKeys={seriesKeys} />
      <div className="h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={points}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="cashflow-income" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={SERIES_COLORS.income}
                  stopOpacity={0.32}
                />
                <stop
                  offset="100%"
                  stopColor={SERIES_COLORS.income}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="cashflow-expenses"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={SERIES_COLORS.expenses}
                  stopOpacity={0.32}
                />
                <stop
                  offset="100%"
                  stopColor={SERIES_COLORS.expenses}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke={colors.brown[100]}
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonthShort}
              tick={{ fill: colors.brown[500], fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fill: colors.brown[500], fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip content={CashflowTooltip} />
            {showIncome && (
              <Area
                type="monotone"
                dataKey="income"
                stroke={SERIES_COLORS.income}
                strokeWidth={2}
                fill="url(#cashflow-income)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
            {showExpenses && (
              <Area
                type="monotone"
                dataKey="expenses"
                stroke={SERIES_COLORS.expenses}
                strokeWidth={2}
                fill="url(#cashflow-expenses)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
            {showBalance && (
              <Line
                type="monotone"
                dataKey="balance"
                stroke={SERIES_COLORS.balance}
                strokeWidth={2.5}
                dot={{ r: 3, fill: SERIES_COLORS.balance, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
