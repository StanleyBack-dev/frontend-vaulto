import {
  Bar,
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
import type { AdminReferralMonthlyPoint } from "@/features/admin";

interface ReferralTrendChartProps {
  points: AdminReferralMonthlyPoint[];
}

const SERIES_COLORS = {
  qualifiedReferrals: colors.purple[500],
  creditsGranted: colors.gold[500],
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((value || 0) / 100);
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format((value || 0) / 100);
}

function formatMonthShort(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  if (!year || !monthNum) return month;

  const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(
    new Date(year, monthNum - 1, 1),
  );
  return `${label.replace(".", "")}/${String(year).slice(2)}`;
}

function ReferralTrendTooltip({ active, payload, label }: TooltipContentProps) {
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
          const isCredits = entry.dataKey === "creditsGrantedCents";

          return (
            <div
              key={String(entry.dataKey)}
              className="flex items-center justify-between gap-6"
            >
              <span
                className="flex items-center gap-1.5"
                style={{ color: "#b7afcf" }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: isCredits
                      ? SERIES_COLORS.creditsGranted
                      : SERIES_COLORS.qualifiedReferrals,
                  }}
                />
                {isCredits ? "Valor gerado" : "Indicações"}
              </span>
              <span className="font-semibold" style={{ color: "#f7f5ff" }}>
                {isCredits
                  ? formatCurrency(Number(entry.value ?? 0))
                  : Number(entry.value ?? 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReferralTrendChart({
  points,
}: ReferralTrendChartProps) {
  if (points.every((point) => point.qualifiedReferrals === 0)) {
    return (
      <p className="text-sm" style={{ color: colors.brown[500] }}>
        Sem indicações qualificadas no período selecionado.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-4">
        <span
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{
            color: colors.brown[500],
            fontFamily: typography.fontFamily,
          }}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: SERIES_COLORS.qualifiedReferrals }}
          />
          Indicações qualificadas
        </span>
        <span
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{
            color: colors.brown[500],
            fontFamily: typography.fontFamily,
          }}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: SERIES_COLORS.creditsGranted }}
          />
          Valor gerado em créditos
        </span>
      </div>
      <div className="h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={points}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
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
              yAxisId="left"
              allowDecimals={false}
              tick={{ fill: colors.brown[500], fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatCompactCurrency}
              tick={{ fill: colors.brown[500], fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip content={ReferralTrendTooltip} />
            <Bar
              yAxisId="left"
              dataKey="qualifiedReferrals"
              fill={SERIES_COLORS.qualifiedReferrals}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="creditsGrantedCents"
              stroke={SERIES_COLORS.creditsGranted}
              strokeWidth={2.5}
              dot={{ r: 3, fill: SERIES_COLORS.creditsGranted, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
