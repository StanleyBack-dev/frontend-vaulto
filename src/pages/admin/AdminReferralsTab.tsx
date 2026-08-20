import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Gift,
  HandCoins,
  Users as UsersIcon,
  Wallet,
} from "lucide-react";
import SectionCard from "@/components/organisms/SectionCard";
import Loading from "@atoms/Loading";
import Select from "@atoms/Select";
import Input from "@atoms/Input";
import StatCard from "@molecules/StatCard";
import ReferralTrendChart from "@molecules/ReferralTrendChart";
import {
  fetchAdminReferralLeaderboard,
  fetchAdminReferralStats,
  fetchAdminReferralTrend,
  type AdminReferralLeaderboardRow,
  type AdminReferralMonthlyPoint,
  type AdminReferralStats,
} from "@/features/admin";
import { colors } from "@/config";

type TrendPeriod = "3" | "6" | "12" | "THIS_YEAR" | "LAST_YEAR" | "CUSTOM_YEAR";

const TREND_PERIOD_OPTIONS: { value: TrendPeriod; label: string }[] = [
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Últimos 12 meses" },
  { value: "THIS_YEAR", label: "Este ano" },
  { value: "LAST_YEAR", label: "Ano anterior" },
  { value: "CUSTOM_YEAR", label: "Escolher ano" },
];

type LeaderboardSortKey =
  | "qualifiedReferralsCount"
  | "totalCreditsGrantedCents"
  | "availableBalanceCents";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function trendDateRange(
  period: TrendPeriod,
  customYear: number,
): { dateFrom: string; dateTo: string } {
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

    return { dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` };
  }

  const monthsBack = Number(period);
  const from = new Date(
    now.getFullYear(),
    now.getMonth() - (monthsBack - 1),
    1,
  );
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    dateFrom: `${from.getFullYear()}-${pad2(from.getMonth() + 1)}-01`,
    dateTo: `${to.getFullYear()}-${pad2(to.getMonth() + 1)}-${pad2(to.getDate())}`,
  };
}

function trendPeriodLabel(period: TrendPeriod, customYear: number): string {
  if (period === "THIS_YEAR") return `em ${new Date().getFullYear()}`;
  if (period === "LAST_YEAR") return `em ${new Date().getFullYear() - 1}`;
  if (period === "CUSTOM_YEAR") return `em ${customYear}`;
  return `nos últimos ${period} meses`;
}

function formatCurrencyFromCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((cents || 0) / 100);
}

function SortableHeader({
  label,
  sortKey,
  activeSort,
  direction,
  onSort,
}: {
  label: string;
  sortKey: LeaderboardSortKey;
  activeSort: LeaderboardSortKey;
  direction: "asc" | "desc";
  onSort: (key: LeaderboardSortKey) => void;
}) {
  const isActive = activeSort === sortKey;

  return (
    <th className="py-2 pr-4">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 font-semibold uppercase tracking-wide"
      >
        {label}
        {isActive ? (
          direction === "desc" ? (
            <ArrowDown size={12} />
          ) : (
            <ArrowUp size={12} />
          )
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </button>
    </th>
  );
}

export default function AdminReferralsTab() {
  const [stats, setStats] = useState<AdminReferralStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<AdminReferralLeaderboardRow[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("6");
  const [customYear, setCustomYear] = useState(() => new Date().getFullYear());
  const [trend, setTrend] = useState<AdminReferralMonthlyPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);

  const [sortKey, setSortKey] = useState<LeaderboardSortKey>(
    "qualifiedReferralsCount",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchAdminReferralStats(), fetchAdminReferralLeaderboard()])
      .then(([statsResult, leaderboardResult]) => {
        if (cancelled) return;
        setStats(statsResult);
        setLeaderboard(leaderboardResult);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os dados de indicações.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setTrendLoading(true);

    fetchAdminReferralTrend(trendDateRange(trendPeriod, customYear))
      .then((points) => {
        if (!cancelled) setTrend(points);
      })
      .catch(() => {
        // The summary cards above already surface a load error if the page
        // failed outright — a trend-only failure just leaves the chart
        // showing no data rather than piling on a second error message.
      })
      .finally(() => {
        if (!cancelled) setTrendLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [trendPeriod, customYear]);

  const sortedLeaderboard = useMemo(() => {
    const rows = [...leaderboard];
    rows.sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDirection === "desc" ? -diff : diff;
    });
    return rows;
  }, [leaderboard, sortKey, sortDirection]);

  function handleSort(key: LeaderboardSortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDirection("desc");
  }

  if (error) {
    return (
      <p className="text-sm" style={{ color: colors.brown[500] }}>
        {error}
      </p>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loading label="Carregando dados de indicações..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<UsersIcon size={20} />}
          label="Usuários vindos por indicação"
          value={stats.totalReferredUsers}
          sub={`${stats.totalQualifiedReferrals} qualificadas (assinaram o Pro)`}
        />
        <StatCard
          icon={<Gift size={20} />}
          label="Valor por indicação"
          value={formatCurrencyFromCents(stats.creditAmountCents)}
        />
        <StatCard
          icon={<HandCoins size={20} />}
          label="Total gerado em créditos"
          value={formatCurrencyFromCents(stats.totalCreditsGrantedCents)}
          sub={
            stats.totalClawedBackCents > 0
              ? `${formatCurrencyFromCents(stats.totalClawedBackCents)} estornados`
              : undefined
          }
        />
        <StatCard
          icon={<Wallet size={20} />}
          label="Total já pago (saques concluídos)"
          value={formatCurrencyFromCents(stats.totalWithdrawnCents)}
        />
        <StatCard
          icon={<Wallet size={20} />}
          label="Pendente de processamento"
          value={formatCurrencyFromCents(stats.totalPendingWithdrawalCents)}
          sub="Saques solicitados ou em processamento"
        />
        <StatCard
          icon={<Wallet size={20} />}
          label="Passivo em aberto"
          value={formatCurrencyFromCents(stats.totalOutstandingLiabilityCents)}
          sub="Saldo disponível para saque de todos os usuários, hoje"
          valueColor={colors.gold[500]}
        />
      </div>

      <SectionCard
        title="Evolução das indicações"
        description={`Indicações qualificadas e valor gerado ${trendPeriodLabel(trendPeriod, customYear)}.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={trendPeriod}
              onChange={(event) =>
                setTrendPeriod(event.target.value as TrendPeriod)
              }
              aria-label="Período da evolução"
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
        {trendLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loading label="Carregando..." />
          </div>
        ) : (
          <ReferralTrendChart points={trend} />
        )}
      </SectionCard>

      <SectionCard
        title="Ranking de indicadores"
        description="Usuários que mais indicaram, ordenável por coluna."
      >
        {sortedLeaderboard.length === 0 ? (
          <p className="text-sm" style={{ color: colors.brown[500] }}>
            Nenhum usuário indicou amigos ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b text-left text-xs"
                  style={{
                    borderColor: colors.brown[100],
                    color: colors.brown[500],
                  }}
                >
                  <th className="py-2 pr-4 font-semibold uppercase tracking-wide">
                    Nome
                  </th>
                  <th className="py-2 pr-4 font-semibold uppercase tracking-wide">
                    Email
                  </th>
                  <SortableHeader
                    label="Indicações"
                    sortKey="qualifiedReferralsCount"
                    activeSort={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Valor gerado"
                    sortKey="totalCreditsGrantedCents"
                    activeSort={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Saldo disponível"
                    sortKey="availableBalanceCents"
                    activeSort={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map((row) => (
                  <tr
                    key={row.idUsers}
                    className="border-b last:border-0"
                    style={{ borderColor: colors.brown[100] }}
                  >
                    <td
                      className="py-2.5 pr-4 font-semibold"
                      style={{ color: colors.brown[800] }}
                    >
                      {row.name}
                    </td>
                    <td
                      className="py-2.5 pr-4"
                      style={{ color: colors.brown[500] }}
                    >
                      {row.email}
                    </td>
                    <td
                      className="py-2.5 pr-4 font-semibold"
                      style={{ color: colors.brown[800] }}
                    >
                      {row.qualifiedReferralsCount}
                    </td>
                    <td
                      className="py-2.5 pr-4"
                      style={{ color: colors.brown[500] }}
                    >
                      {formatCurrencyFromCents(row.totalCreditsGrantedCents)}
                    </td>
                    <td
                      className="py-2.5 pr-4"
                      style={{ color: colors.brown[500] }}
                    >
                      {formatCurrencyFromCents(row.availableBalanceCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
