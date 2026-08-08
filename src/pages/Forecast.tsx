import { useState, type FormEvent } from "react";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Loading from "@/components/atoms/Loading";
import SectionCard from "@/components/organisms/SectionCard";
import { useBillingContext } from "@/features/billing";
import {
  fetchFinancialForecast,
  type FinancialForecast,
} from "@/features/reports";
import { planRoutePaths } from "@/router";
import { maskCurrencyInput } from "@/utils/format";
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

function parseCurrency(value: string): number {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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

export default function Forecast() {
  const navigate = useNavigate();
  const { subscription, isLoading: isSubscriptionLoading } =
    useBillingContext();
  const { showError } = useToast();

  const [currentBalance, setCurrentBalance] = useState("");
  const [periodMode, setPeriodMode] = useState<PeriodMode>("predefined");
  const [periodDays, setPeriodDays] = useState("30");
  const [customDate, setCustomDate] = useState("");
  const [result, setResult] = useState<FinancialForecast | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const isPro = subscription?.plan === "PRO";
  const minCustomDate = tomorrowDateInputValue();

  async function handleCalculate(event: FormEvent) {
    event.preventDefault();

    let periodEnd: Date;

    if (periodMode === "custom") {
      if (!customDate || customDate < minCustomDate) {
        showError(
          "Data inválida",
          "Escolha uma data futura, a partir de amanhã.",
        );
        return;
      }
      periodEnd = new Date(`${customDate}T23:59:59`);
    } else {
      periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + Number(periodDays));
    }

    setIsCalculating(true);

    try {
      const forecast = await fetchFinancialForecast({
        currentBalance: parseCurrency(currentBalance),
        periodEnd: periodEnd.toISOString(),
      });

      setResult(forecast);
    } catch (error) {
      showError(
        "Não foi possível calcular",
        error instanceof Error
          ? error.message
          : "Tente novamente em instantes.",
      );
    } finally {
      setIsCalculating(false);
    }
  }

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
        title="Previsão financeira"
        description="Descubra quanto você pode gastar com segurança."
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
            A previsão financeira é um recurso exclusivo do Vaulto Pro. Informe
            seu saldo atual e veja quanto pode gastar com segurança,
            considerando suas receitas e dívidas em aberto no período.
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
        title="Quanto você pode gastar com segurança?"
        description="Informe seu saldo disponível hoje. Calculamos com base nas receitas e dívidas em aberto no período escolhido."
      >
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
            <Input
              label="Saldo atual disponível"
              inputMode="decimal"
              value={currentBalance}
              onChange={(event) =>
                setCurrentBalance(maskCurrencyInput(event.target.value))
              }
              placeholder="0,00"
              required
            />

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
                label="Prever até"
                type="date"
                value={customDate}
                min={minCustomDate}
                onChange={(event) => setCustomDate(event.target.value)}
                required
              />
            )}
          </div>

          <Button type="submit" variant="primary" loading={isCalculating}>
            Calcular
          </Button>
        </form>
      </SectionCard>

      {result && (
        <SectionCard
          title="Resultado"
          description="Valores previstos para o período selecionado."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
              <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                Saldo informado
              </p>
              <p className="mt-2 text-xl font-semibold text-[#f7f5ff]">
                {formatCurrency(result.currentBalance)}
              </p>
            </div>
            <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
              <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                Receitas previstas
              </p>
              <p className="mt-2 text-xl font-semibold text-emerald-300">
                + {formatCurrency(result.projectedIncome)}
              </p>
            </div>
            <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
              <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                Dívidas previstas
              </p>
              <p className="mt-2 text-xl font-semibold text-amber-200">
                − {formatCurrency(result.projectedExpenses)}
              </p>
            </div>
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: colors.gold[500],
                background: `${colors.gold[500]}1f`,
              }}
            >
              <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                Você pode gastar com segurança
              </p>
              <p
                className="mt-2 text-xl font-bold"
                style={{
                  color: result.safeToSpend < 0 ? "#f87171" : colors.gold[500],
                }}
              >
                {formatCurrency(result.safeToSpend)}
              </p>
            </div>
          </div>

          {result.safeToSpend < 0 && (
            <p className="mt-4 text-xs" style={{ color: "#f87171" }}>
              Suas dívidas previstas superam o saldo e as receitas do período.
              Priorize quitar ou renegociar os valores em aberto.
            </p>
          )}
        </SectionCard>
      )}
    </div>
  );
}
