import { BarChart3, CircleDollarSign, Clock3, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import StatCard from "@/components/molecules/StatCard";
import SectionCard from "@/components/organisms/SectionCard";
import { debtRoutePaths } from "@/router";
import { useDebtsContext } from "@/features/debts";
import { colors } from "@/config";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export default function DebtsDashboard() {
  const navigate = useNavigate();
  const { debts } = useDebtsContext();
  const [period, setPeriod] = useState("month");
  const [riskLevel, setRiskLevel] = useState("all");

  const metrics = useMemo(() => {
    const total = debts.reduce((sum, debt) => sum + debt.totalAmount, 0);

    const paid = debts
      .flatMap((debt) => debt.payments)
      .reduce((sum, payment) => sum + payment.amountPaid, 0);

    const overdue = debts.filter((debt) => debt.status === "OVERDUE").length;
    const open = debts.filter((debt) => debt.status === "OPEN").length;

    return {
      total,
      paid,
      open,
      overdue,
    };
  }, [debts]);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Painel principal de dividas"
        description="Visao macro de passivos financeiros com filtros estrategicos para apoio executivo."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(debtRoutePaths.management)}
            >
              Ir para gestao
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(debtRoutePaths.reports)}
            >
              Ver relatorios
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Select
            label="Periodo"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            style={{
              background: colors.black[700],
              color: colors.white,
            }}
          >
            <option value="week">Ultimos 7 dias</option>
            <option value="month">Ultimos 30 dias</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Ano atual</option>
          </Select>
          <Select
            label="Risco"
            value={riskLevel}
            onChange={(event) => setRiskLevel(event.target.value)}
            style={{
              background: colors.black[700],
              color: colors.white,
            }}
          >
            <option value="all">Todos</option>
            <option value="critical">Critico</option>
            <option value="attention">Atencao</option>
            <option value="stable">Estavel</option>
          </Select>
          <Select
            label="Visao"
            value="geral"
            onChange={() => {}}
            style={{
              background: colors.black[700],
              color: colors.white,
            }}
          >
            <option value="geral">Consolidada</option>
            <option value="conta">Por conta</option>
            <option value="status">Por status</option>
          </Select>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CircleDollarSign size={18} />}
          label="Exposicao total"
          value={formatCurrency(metrics.total)}
          sub="Saldo geral das dividas"
          color={colors.gold[500]}
          className="bg-[#141225] border-[#3a2f5e]"
        />
        <StatCard
          icon={<BarChart3 size={18} />}
          label="Pagamentos acumulados"
          value={formatCurrency(metrics.paid)}
          sub="Valor quitado"
          color="#34d399"
          className="bg-[#141225] border-[#3a2f5e]"
        />
        <StatCard
          icon={<Clock3 size={18} />}
          label="Em aberto"
          value={String(metrics.open)}
          sub="Titulos ativos"
          color={colors.purple[500]}
          className="bg-[#141225] border-[#3a2f5e]"
        />
        <StatCard
          icon={<ShieldAlert size={18} />}
          label="Vencidas"
          value={String(metrics.overdue)}
          sub="Demandam acao imediata"
          color="#fb7185"
          className="bg-[#141225] border-[#3a2f5e]"
        />
      </div>

      <SectionCard
        title="Direcionamento rapido"
        description="Atalhos para operacao diaria de dividas."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Button
            variant="primary"
            className="justify-start"
            onClick={() => navigate(debtRoutePaths.create)}
          >
            Cadastrar nova divida
          </Button>
          <Button
            variant="secondary"
            className="justify-start"
            onClick={() => navigate(debtRoutePaths.management)}
          >
            Controlar carteira
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => navigate(debtRoutePaths.reports)}
          >
            Gerar analise consolidada
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
