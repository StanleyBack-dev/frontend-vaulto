import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MousePointerClick,
  TrendingUp,
  Wallet,
} from "lucide-react";
import DataTable from "@/components/organisms/DataTable";
import SectionCard from "@/components/organisms/SectionCard";
import Loading from "@atoms/Loading";
import PlanBadge from "@atoms/PlanBadge";
import Select from "@atoms/Select";
import StatCard from "@molecules/StatCard";
import {
  fetchAdminProLeadStats,
  fetchAdminProLeads,
  type AdminProLeadEventType,
  type AdminProLeadRow,
  type AdminProLeadStats,
} from "@/features/admin";
import { colors } from "@/config";
import { formatDateTimeDisplay } from "@/utils/format";

type EventFilter = AdminProLeadEventType | "ALL";

const EVENT_FILTER_OPTIONS: { value: EventFilter; label: string }[] = [
  { value: "ALL", label: "Todos os eventos" },
  { value: "PLAN_CLICKED", label: "Clicou em Assinar" },
  { value: "CHECKOUT_REACHED", label: "Chegou ao checkout" },
];

const EVENT_LABELS: Record<AdminProLeadEventType, string> = {
  PLAN_CLICKED: "Clicou em Assinar",
  CHECKOUT_REACHED: "Chegou ao checkout",
};

const BILLING_CYCLE_LABELS: Record<string, string> = {
  MONTHLY: "Mensal",
  YEARLY: "Anual",
};

function EventBadge({ eventType }: { eventType: AdminProLeadEventType }) {
  const isCheckout = eventType === "CHECKOUT_REACHED";

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        background: isCheckout ? "rgba(212,175,55,0.16)" : colors.brown[100],
        color: isCheckout ? colors.gold[500] : colors.brown[500],
      }}
    >
      {EVENT_LABELS[eventType]}
    </span>
  );
}

function formatConversionRate(numerator: number, denominator: number): string {
  if (denominator === 0) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export default function AdminLeadsTab() {
  const [stats, setStats] = useState<AdminProLeadStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [leads, setLeads] = useState<AdminProLeadRow[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  const [eventFilter, setEventFilter] = useState<EventFilter>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
  });

  useEffect(() => {
    let cancelled = false;

    fetchAdminProLeadStats()
      .then((result) => {
        if (!cancelled) setStats(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setStatsError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar as estatísticas de leads.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLeadsLoading(true);

    fetchAdminProLeads({
      page,
      limit,
      eventType: eventFilter === "ALL" ? undefined : eventFilter,
    })
      .then((result) => {
        if (cancelled) return;
        setLeads(result.items);
        setPagination({
          total: result.total,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setLeadsError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os leads.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLeadsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, eventFilter]);

  if (statsError) {
    return (
      <p className="text-sm" style={{ color: colors.brown[500] }}>
        {statsError}
      </p>
    );
  }

  if (statsLoading || !stats) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loading label="Carregando dados de leads..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<MousePointerClick size={20} />}
          label="Cliques em Assinar"
          value={stats.totalPlanClicks}
          sub={`${stats.uniqueUsersClicked} usuário(s) único(s)`}
        />
        <StatCard
          icon={<Wallet size={20} />}
          label="Chegaram ao checkout"
          value={stats.totalCheckoutReached}
          sub={`${stats.uniqueUsersReachedCheckout} usuário(s) único(s)`}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Conversão clique → checkout"
          value={formatConversionRate(
            stats.uniqueUsersReachedCheckout,
            stats.uniqueUsersClicked,
          )}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Converteram para Pro"
          value={stats.convertedToProCount}
          valueColor={colors.gold[500]}
        />
      </div>

      <SectionCard
        title="Leads"
        description="Usuários que clicaram em assinar ou chegaram ao checkout do Vaulto Pro."
        action={
          <Select
            value={eventFilter}
            onChange={(event) => {
              setPage(1);
              setEventFilter(event.target.value as EventFilter);
            }}
            aria-label="Filtrar por evento"
            wrapperClassName="w-full sm:w-auto"
          >
            {EVENT_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        }
      >
        {leadsError ? (
          <p className="text-sm" style={{ color: colors.brown[500] }}>
            {leadsError}
          </p>
        ) : leadsLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loading label="Carregando leads..." />
          </div>
        ) : (
          <>
            <DataTable
              data={leads}
              getId={(row) => row.idProLeadEvent}
              emptyMessage="Nenhum lead registrado ainda."
              columns={[
                { key: "name", label: "Nome" },
                { key: "email", label: "Email" },
                {
                  key: "eventType",
                  label: "Evento",
                  render: (row) => <EventBadge eventType={row.eventType} />,
                },
                {
                  key: "billingCycle",
                  label: "Ciclo",
                  render: (row) =>
                    row.billingCycle
                      ? (BILLING_CYCLE_LABELS[row.billingCycle] ??
                        row.billingCycle)
                      : "—",
                },
                {
                  key: "createdAt",
                  label: "Data",
                  render: (row) => formatDateTimeDisplay(row.createdAt),
                },
                {
                  key: "currentPlan",
                  label: "Plano atual",
                  render: (row) => (
                    <PlanBadge
                      plan={row.currentPlan}
                      status={row.currentSubscriptionStatus ?? "ACTIVE"}
                    />
                  ),
                },
              ]}
            />

            <div
              className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
              style={{ color: colors.brown[500] }}
            >
              <span>
                Página {page} de {Math.max(pagination.totalPages, 1)}
                {" - "}
                {pagination.total} registros
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <span>Itens:</span>
                  <select
                    className="rounded border px-2 py-1"
                    style={{
                      borderColor: colors.brown[100],
                      color: colors.brown[800],
                    }}
                    value={limit}
                    onChange={(event) => {
                      setPage(1);
                      setLimit(Number(event.target.value));
                    }}
                    disabled={leadsLoading}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="rounded border px-3 py-1 disabled:opacity-50"
                  style={{
                    borderColor: colors.brown[100],
                    color: colors.brown[500],
                  }}
                  onClick={() => setPage((current) => current - 1)}
                  disabled={leadsLoading || page <= 1}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="rounded border px-3 py-1 disabled:opacity-50"
                  style={{
                    borderColor: colors.brown[100],
                    color: colors.brown[500],
                  }}
                  onClick={() => setPage((current) => current + 1)}
                  disabled={leadsLoading || !pagination.hasNextPage}
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
