import { useEffect, useState } from "react";
import { Crown, Headset, TrendingUp, Users as UsersIcon } from "lucide-react";
import StatCard from "@molecules/StatCard";
import {
  fetchAdminDashboardStats,
  type AdminDashboardStats,
} from "@/features/admin";
import { colors } from "@/config";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function AdminOverviewTab() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchAdminDashboardStats()
      .then((result) => {
        if (isMounted) {
          setStats(result);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar as estatísticas.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <p className="text-sm" style={{ color: colors.brown[500] }}>
        {error}
      </p>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-40">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2"
          style={{
            borderColor: colors.gold[500],
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        icon={<UsersIcon size={20} />}
        label="Usuários cadastrados"
        value={stats.totalUsers}
      />
      <StatCard
        icon={<Crown size={20} />}
        label="Assinaturas Pro ativas"
        value={stats.activeProSubscriptions}
        sub={`${stats.freeSubscriptions} no plano gratuito`}
      />
      <StatCard
        icon={<TrendingUp size={20} />}
        label="Receita recorrente estimada (MRR)"
        value={formatCurrency(stats.estimatedMonthlyRecurringRevenue)}
      />
      <StatCard
        icon={<Headset size={20} />}
        label="Chamados de suporte abertos"
        value={stats.openSupportTickets}
        sub={`${stats.resolvedSupportTickets} finalizados de ${stats.totalSupportTickets} no total`}
      />
      {stats.subscriptionsByStatus.map((entry) => (
        <StatCard
          key={entry.status}
          label={`Assinaturas — ${entry.status}`}
          value={entry.count}
        />
      ))}
    </div>
  );
}
