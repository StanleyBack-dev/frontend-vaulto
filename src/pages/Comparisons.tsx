import { useMemo, useState, type FormEvent } from "react";
import { Crown, TrendingDown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/atoms/Loading";
import Select from "@/components/atoms/Select";
import SectionCard from "@/components/organisms/SectionCard";
import { useBillingContext } from "@/features/billing";
import { currentMonthValue, formatMonthLabel } from "@/features/debts";
import {
  fetchCategoryComparison,
  type CategoryComparison,
  type CategoryComparisonGroup,
} from "@/features/reports";
import { planRoutePaths } from "@/router";
import { colors } from "@/config";
import { useToast } from "../shared/toast/useToast";

type ChangeDirection = "up" | "down";
type ComparisonMode = "predefined" | "custom";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function toErrorMessage(error: unknown): string | undefined {
  return error instanceof Error && error.message ? error.message : undefined;
}

function formatPercent(value: number | null): string {
  if (value === null) return "Novo";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

function previousMonthValue(monthValue: string): string {
  const [yearStr, monthStr] = monthValue.split("-");
  const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  date.setMonth(date.getMonth() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function changeColor(
  value: number | null,
  goodDirection: ChangeDirection,
): string {
  if (value === null || value === 0) return "#b7afcf";
  const isUp = value > 0;
  const isGood = goodDirection === "up" ? isUp : !isUp;
  return isGood ? "#6ee7b7" : "#f87171";
}

export default function Comparisons() {
  const navigate = useNavigate();
  const { subscription, isLoading: isSubscriptionLoading } =
    useBillingContext();
  const { showError } = useToast();

  const [mode, setMode] = useState<ComparisonMode>("predefined");
  const [month, setMonth] = useState(currentMonthValue);
  const [compareMonth, setCompareMonth] = useState(() =>
    previousMonthValue(currentMonthValue()),
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CategoryComparison | null>(null);

  const isPro = subscription?.plan === "PRO";
  const monthLabel = useMemo(() => formatMonthLabel(month), [month]);
  const compareLabel = useMemo(
    () =>
      formatMonthLabel(
        mode === "custom" ? compareMonth : previousMonthValue(month),
      ),
    [mode, month, compareMonth],
  );

  function monthToIsoDate(monthValue: string): string {
    return new Date(`${monthValue}-01T00:00:00.000Z`).toISOString();
  }

  async function handleCompare(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    try {
      const comparison = await fetchCategoryComparison({
        referenceDate: monthToIsoDate(month),
        comparisonDate:
          mode === "custom" ? monthToIsoDate(compareMonth) : undefined,
      });
      setResult(comparison);
    } catch (error) {
      showError(
        "Não foi possível carregar o comparativo",
        toErrorMessage(error),
      );
      setResult(null);
    } finally {
      setLoading(false);
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
        title="Comparativos"
        description="Compare seus gastos e receitas por categoria, mês a mês."
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
            Os comparativos são um recurso exclusivo do Vaulto Pro. Veja quanto
            você gastou e recebeu em cada categoria, comparado ao mês anterior
            (ex.: "Alimentação -18% em relação ao mês passado").
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

  function renderGroup(
    title: string,
    group: CategoryComparisonGroup | undefined,
    goodDirection: ChangeDirection,
  ) {
    if (!group) return null;

    return (
      <SectionCard
        title={title}
        description={`${monthLabel} comparado a ${compareLabel}.`}
      >
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
            <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
              {monthLabel}
            </p>
            <p className="mt-2 text-xl font-semibold text-[#f7f5ff]">
              {formatCurrency(group.currentTotal)}
            </p>
          </div>
          <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
            <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
              {compareLabel}
            </p>
            <p className="mt-2 text-xl font-semibold text-[#d7cfff]">
              {formatCurrency(group.previousTotal)}
            </p>
          </div>
          <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
            <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
              Variação
            </p>
            <p
              className="mt-2 text-xl font-bold"
              style={{ color: changeColor(group.changePercent, goodDirection) }}
            >
              {formatPercent(group.changePercent)}
            </p>
          </div>
        </div>

        {group.categories.length === 0 ? (
          <p className="text-sm" style={{ color: "#b7afcf" }}>
            Nenhum lançamento nesses dois meses.
          </p>
        ) : (
          <div className="space-y-2">
            {group.categories.map((entry) => {
              const color = changeColor(entry.changePercent, goodDirection);
              const Icon =
                entry.changePercent !== null && entry.changePercent < 0
                  ? TrendingDown
                  : TrendingUp;

              return (
                <div
                  key={entry.idCategory}
                  className="flex items-center justify-between rounded-xl border border-[#3a2f5e] bg-[#141225] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#f7f5ff]">
                      {entry.categoryName || "Sem categoria"}
                    </p>
                    <p className="text-xs text-[#b7afcf]">
                      {formatCurrency(entry.previousAmount)} →{" "}
                      {formatCurrency(entry.currentAmount)}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-sm font-bold"
                    style={{ color }}
                  >
                    {entry.changePercent !== null && <Icon size={16} />}
                    {formatPercent(entry.changePercent)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Comparativos"
        description="Compare seus gastos e receitas por categoria entre dois meses."
      >
        <form onSubmit={handleCompare} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
            <Select
              label="Como comparar?"
              value={mode}
              onChange={(event) =>
                setMode(event.target.value as ComparisonMode)
              }
            >
              <option value="predefined">Mês atual vs. mês anterior</option>
              <option value="custom">Escolher os dois meses</option>
            </Select>

            <Input
              label={
                mode === "custom" ? "Mês para analisar" : "Mês de referência"
              }
              type="month"
              value={month}
              onChange={(event) =>
                setMonth(event.target.value || currentMonthValue())
              }
            />

            {mode === "custom" && (
              <Input
                label="Mês para comparar"
                type="month"
                value={compareMonth}
                onChange={(event) =>
                  setCompareMonth(
                    event.target.value ||
                      previousMonthValue(currentMonthValue()),
                  )
                }
              />
            )}
          </div>

          <Button type="submit" variant="primary" loading={loading}>
            Comparar
          </Button>
        </form>
      </SectionCard>

      {loading ? (
        <div className="flex h-56 items-center justify-center">
          <Loading label="Carregando..." />
        </div>
      ) : result ? (
        <>
          {renderGroup("Despesas por categoria", result.expenses, "down")}
          {renderGroup("Receitas por categoria", result.income, "up")}
        </>
      ) : (
        <p className="text-sm" style={{ color: colors.brown[500] }}>
          Selecione o período e clique em "Comparar" para ver o resultado.
        </p>
      )}
    </div>
  );
}
