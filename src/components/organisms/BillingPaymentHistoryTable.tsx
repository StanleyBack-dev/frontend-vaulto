import { useEffect, useState } from "react";
import DataTable from "@/components/organisms/DataTable";
import type { BillingPayment } from "@/api/billing/schema";
import { fetchMyBillingPayments } from "@/features/billing";
import { colors } from "@/config";
import { formatDateDisplay } from "@/utils/format";

const STATUS_LABELS: Record<BillingPayment["status"], string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  RECEIVED: "Recebido",
  OVERDUE: "Atrasado",
  REFUNDED: "Reembolsado",
  DELETED: "Cancelado",
};

const STATUS_COLORS: Record<BillingPayment["status"], string> = {
  PENDING: colors.brown[500],
  CONFIRMED: "#15803d",
  RECEIVED: "#15803d",
  OVERDUE: "#b45309",
  REFUNDED: colors.brown[500],
  DELETED: colors.brown[500],
};

const LIMIT = 10;

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export default function BillingPaymentHistoryTable() {
  const [payments, setPayments] = useState<BillingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchMyBillingPayments({ page, limit: LIMIT })
      .then((result) => {
        if (cancelled) return;
        setPayments(result.items);
        setHasNextPage(result.hasNextPage);
      })
      .catch(() => {
        if (!cancelled) {
          setPayments([]);
          setHasNextPage(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="space-y-3">
      <DataTable
        data={payments}
        getId={(payment) =>
          `${payment.createdAt}-${payment.amount}-${payment.status}-${payment.dueDate ?? ""}`
        }
        emptyMessage={
          loading ? "Carregando..." : "Nenhum pagamento registrado ainda."
        }
        columns={[
          {
            key: "createdAt",
            label: "Data",
            render: (payment) => formatDateDisplay(payment.createdAt) || "—",
          },
          {
            key: "amount",
            label: "Valor",
            render: (payment) => formatAmount(payment.amount),
          },
          {
            key: "status",
            label: "Status",
            render: (payment) => (
              <span
                className="font-semibold"
                style={{ color: STATUS_COLORS[payment.status] }}
              >
                {STATUS_LABELS[payment.status]}
              </span>
            ),
          },
        ]}
      />

      {(page > 1 || hasNextPage) && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || loading}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            style={{ borderColor: colors.brown[100], color: colors.brown[500] }}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!hasNextPage || loading}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            style={{ borderColor: colors.brown[100], color: colors.brown[500] }}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
