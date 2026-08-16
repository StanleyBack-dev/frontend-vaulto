import { useEffect, useState, type FormEvent } from "react";
import { Crown, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Loading from "@/components/atoms/Loading";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import SectionCard from "@/components/organisms/SectionCard";
import { useBillingContext } from "@/features/billing";
import {
  fetchFinancialHealthScore,
  type FinancialHealthPillarScore,
  type FinancialHealthScore,
  type FinancialHealthStatus,
} from "@/features/reports";
import { goalRoutePaths, planRoutePaths } from "@/router";
import { formatDateDisplay } from "@/utils/format";
import { colors } from "@/config";
import { useToast } from "../shared/toast/useToast";

const PERIOD_OPTIONS = [
  { value: "7", label: "Próximos 7 dias" },
  { value: "15", label: "Próximos 15 dias" },
  { value: "30", label: "Próximos 30 dias" },
  { value: "60", label: "Próximos 60 dias" },
  { value: "90", label: "Próximos 90 dias" },
];

type PeriodMode = "predefined" | "custom";

function toErrorMessage(error: unknown): string | undefined {
  return error instanceof Error && error.message ? error.message : undefined;
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function tomorrowDateInputValue(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateInputValue(tomorrow);
}

const STATUS_COPY: Record<
  FinancialHealthStatus,
  { label: string; color: string; description: string }
> = {
  HEALTHY: {
    label: "Saudável",
    color: "#6ee7b7",
    description:
      "Suas dívidas cabem confortavelmente nas suas receitas e você está em dia.",
  },
  ATTENTION: {
    label: "Atenção",
    color: "#fcd34d",
    description:
      "Alguns pontos merecem cuidado antes que virem um problema maior.",
  },
  CRITICAL: {
    label: "Crítico",
    color: "#fda4af",
    description:
      "Seu comprometimento com dívidas ou atrasos está em um nível de risco.",
  },
};

interface PillarCardProps {
  title: string;
  description: string;
  pillar: FinancialHealthPillarScore | null;
  emptyState?: { message: string; actionLabel: string; onAction: () => void };
}

function PillarCard({
  title,
  description,
  pillar,
  emptyState,
}: PillarCardProps) {
  return (
    <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#f7f5ff]">{title}</p>
        {pillar && (
          <span className="text-xs text-[#b7afcf]">
            peso {Math.round(pillar.weight * 100)}%
          </span>
        )}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-[#b7afcf]">
        {description}
      </p>

      {pillar ? (
        <>
          <p className="mt-3 text-2xl font-bold text-[#f7f5ff]">
            {pillar.score}
            <span className="text-sm font-normal text-[#b7afcf]">/100</span>
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#231a3b]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pillar.score}%`,
                background: colors.gold[500],
              }}
            />
          </div>
        </>
      ) : (
        emptyState && (
          <div className="mt-3">
            <p className="text-xs text-[#b7afcf]">{emptyState.message}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={emptyState.onAction}
            >
              {emptyState.actionLabel}
            </Button>
          </div>
        )
      )}
    </div>
  );
}

export default function FinancialHealth() {
  const navigate = useNavigate();
  const { isPro, isLoading: isSubscriptionLoading } = useBillingContext();
  const { showError } = useToast();

  const [periodMode, setPeriodMode] = useState<PeriodMode>("predefined");
  const [periodDays, setPeriodDays] = useState("30");
  const [customDate, setCustomDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FinancialHealthScore | null>(null);

  const minCustomDate = tomorrowDateInputValue();

  async function loadScore(periodEnd?: Date) {
    setLoading(true);
    try {
      const score = await fetchFinancialHealthScore(
        periodEnd ? { periodEnd: periodEnd.toISOString() } : {},
      );
      setResult(score);
    } catch (error) {
      showError(
        "Não foi possível calcular sua saúde financeira",
        toErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCalculate(event: FormEvent) {
    event.preventDefault();

    if (periodMode === "custom") {
      if (!customDate || customDate < minCustomDate) {
        showError(
          "Data inválida",
          "Escolha uma data futura, a partir de amanhã.",
        );
        return;
      }
      await loadScore(new Date(`${customDate}T23:59:59`));
      return;
    }

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + Number(periodDays));
    await loadScore(periodEnd);
  }

  useEffect(() => {
    if (isPro) {
      void loadScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

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
        title="Saúde Financeira"
        description="Um indicador de 0 a 100 da sua situação financeira."
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
            A Saúde Financeira é um recurso exclusivo do Vaulto Pro: um score de
            0 a 100 combinando comprometimento com dívidas, pontualidade nos
            pagamentos e reservas guardadas em metas.
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

  return (
    <div className="space-y-6">
      <SectionCard
        title="Saúde Financeira"
        description="Escolha até quando olhar as dívidas e receitas em aberto. Calculamos um score de 0 a 100 combinando comprometimento com dívidas, pontualidade e reservas."
      >
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
            <Select
              label="Como definir o período?"
              value={periodMode}
              onChange={(event) =>
                setPeriodMode(event.target.value as PeriodMode)
              }
            >
              <option value="predefined">Período pré-definido</option>
              <option value="custom">Data específica</option>
            </Select>

            {periodMode === "predefined" ? (
              <Select
                label="Período"
                value={periodDays}
                onChange={(event) => setPeriodDays(event.target.value)}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                label="Considerar até"
                type="date"
                value={customDate}
                min={minCustomDate}
                onChange={(event) => setCustomDate(event.target.value)}
                required
              />
            )}
          </div>

          <Button type="submit" variant="primary" loading={loading}>
            Recalcular
          </Button>
        </form>
      </SectionCard>

      {loading && !result && (
        <div className="flex h-40 items-center justify-center">
          <Loading label="Calculando..." />
        </div>
      )}

      {result && (
        <SectionCard
          title="Resultado"
          description="Score calculado para o período selecionado."
        >
          <div
            className="flex flex-col items-center gap-3 rounded-xl border p-6 text-center sm:flex-row sm:justify-between sm:text-left"
            style={{
              borderColor: STATUS_COPY[result.status].color,
              background: `${STATUS_COPY[result.status].color}1f`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: STATUS_COPY[result.status].color,
                  color: colors.black[900],
                }}
              >
                <HeartPulse size={28} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                  Seu score
                </p>
                <p
                  className="text-4xl font-bold"
                  style={{ color: STATUS_COPY[result.status].color }}
                >
                  {result.score}
                  <span className="text-lg font-normal text-[#b7afcf]">
                    /100
                  </span>
                </p>
              </div>
            </div>
            <div className="max-w-md">
              <p
                className="text-sm font-semibold"
                style={{ color: STATUS_COPY[result.status].color }}
              >
                {STATUS_COPY[result.status].label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#b7afcf]">
                {STATUS_COPY[result.status].description}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-[#8a7fae]">
            Período considerado: {formatDateDisplay(result.periodStart)} a{" "}
            {formatDateDisplay(result.periodEnd)}.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <PillarCard
              title="Comprometimento com dívidas"
              description="Quanto das suas receitas esperadas já está comprometido com dívidas em aberto no período."
              pillar={result.debtCommitment}
            />
            <PillarCard
              title="Pontualidade"
              description="Proporção de dívidas em dia, sem vencimentos em atraso."
              pillar={result.punctuality}
            />
            <PillarCard
              title="Reservas"
              description="Progresso médio das suas metas financeiras."
              pillar={result.reserves}
              emptyState={{
                message:
                  "Você ainda não tem metas cadastradas — crie uma para incluir reservas no seu score.",
                actionLabel: "Criar meta",
                onAction: () => navigate(goalRoutePaths.create),
              }}
            />
          </div>
        </SectionCard>
      )}
    </div>
  );
}
