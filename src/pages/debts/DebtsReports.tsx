import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import SectionCard from "@/components/organisms/SectionCard";
import { debtRoutePaths } from "@/router";
import {
  debtStatusLabel,
  debtTypeLabel,
  useDebtsContext,
} from "@/features/debts";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export default function DebtsReports() {
  const navigate = useNavigate();
  const { debts } = useDebtsContext();
  const [aggregation, setAggregation] = useState<"status" | "type">("status");

  const grouped = useMemo(() => {
    const map = new Map<string, number>();

    for (const debt of debts) {
      const key = aggregation === "status" ? debt.status : debt.debtType;
      const previous = map.get(key) || 0;
      map.set(key, previous + debt.totalAmount);
    }

    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [aggregation, debts]);

  const totals = useMemo(() => {
    const totalExposure = debts.reduce(
      (sum, debt) => sum + debt.totalAmount,
      0,
    );
    const totalPaid = debts
      .flatMap((debt) => debt.payments)
      .reduce((sum, payment) => sum + payment.amountPaid, 0);

    return {
      totalExposure,
      totalPaid,
      balance: Math.max(totalExposure - totalPaid, 0),
    };
  }, [debts]);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Relatórios de dívidas"
        description="Leitura consolidada para tomada de decisão financeira."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(debtRoutePaths.management)}
          >
            Voltar para gestão
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
            <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
              Exposição total
            </p>
            <p className="mt-2 text-xl font-semibold text-[#f7f5ff]">
              {formatCurrency(totals.totalExposure)}
            </p>
          </div>
          <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
            <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
              Total pago
            </p>
            <p className="mt-2 text-xl font-semibold text-emerald-300">
              {formatCurrency(totals.totalPaid)}
            </p>
          </div>
          <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
            <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
              Saldo pendente
            </p>
            <p className="mt-2 text-xl font-semibold text-amber-200">
              {formatCurrency(totals.balance)}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Concentração"
        description="Distribuição de valores por agrupamento selecionado."
      >
        <div className="mb-4 max-w-xs">
          <Select
            label="Agrupar por"
            value={aggregation}
            onChange={(event) =>
              setAggregation(event.target.value as "status" | "type")
            }
          >
            <option value="status">Status</option>
            <option value="type">Tipo</option>
          </Select>
        </div>

        <div className="space-y-3">
          {grouped.map(([key, amount]) => {
            const label =
              aggregation === "status"
                ? debtStatusLabel(key as never)
                : debtTypeLabel(key as never);

            const percent =
              totals.totalExposure > 0
                ? Math.round((amount / totals.totalExposure) * 100)
                : 0;

            return (
              <div
                key={key}
                className="rounded-xl border border-[#3a2f5e] bg-[#141225] px-4 py-3"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#f7f5ff]">{label}</span>
                  <span className="text-[#d7cfff]">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#1e1830]">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#7B3FF2] to-[#D4AF37]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#b7afcf]">
                  {percent}% da carteira
                </p>
              </div>
            );
          })}

          {grouped.length === 0 && (
            <p className="text-sm text-[#b7afcf]">
              Nenhum dado disponível para gerar o relatório no momento.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
