import { useState, type FormEvent } from "react";
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
type PeriodType = "MONTH" | "QUARTER" | "SEMESTER" | "YEAR";

const PERIOD_TYPE_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: "MONTH", label: "Mês" },
  { value: "QUARTER", label: "Trimestre" },
  { value: "SEMESTER", label: "Semestre" },
  { value: "YEAR", label: "Ano" },
];

const QUARTER_OPTIONS = [
  { value: 1, label: "1º trimestre (Jan-Mar)" },
  { value: 2, label: "2º trimestre (Abr-Jun)" },
  { value: 3, label: "3º trimestre (Jul-Set)" },
  { value: 4, label: "4º trimestre (Out-Dez)" },
];

const SEMESTER_OPTIONS = [
  { value: 1, label: "1º semestre (Jan-Jun)" },
  { value: 2, label: "2º semestre (Jul-Dez)" },
];

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

function monthToYear(monthValue: string): number {
  return Number(monthValue.split("-")[0]);
}

function monthToQuarter(monthValue: string): number {
  const month = Number(monthValue.split("-")[1]);
  return Math.floor((month - 1) / 3) + 1;
}

function monthToSemester(monthValue: string): number {
  const month = Number(monthValue.split("-")[1]);
  return Math.floor((month - 1) / 6) + 1;
}

function buildMonthValue(year: number, monthNumber1Based: number): string {
  return `${year}-${String(monthNumber1Based).padStart(2, "0")}`;
}

function quarterStartMonth(quarter: number): number {
  return (quarter - 1) * 3 + 1;
}

function semesterStartMonth(semester: number): number {
  return (semester - 1) * 6 + 1;
}

function isoToMonthValue(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatPeriodLabel(periodType: PeriodType, monthValue: string): string {
  const year = monthToYear(monthValue);

  if (periodType === "YEAR") return String(year);
  if (periodType === "QUARTER")
    return `${monthToQuarter(monthValue)}º trimestre de ${year}`;
  if (periodType === "SEMESTER")
    return `${monthToSemester(monthValue)}º semestre de ${year}`;

  return formatMonthLabel(monthValue);
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

function monthToIsoDate(monthValue: string): string {
  return new Date(`${monthValue}-01T00:00:00.000Z`).toISOString();
}

export default function Comparisons() {
  const navigate = useNavigate();
  const { isPro, isLoading: isSubscriptionLoading } = useBillingContext();
  const { showError } = useToast();

  const [periodType, setPeriodType] = useState<PeriodType>("MONTH");
  const [mode, setMode] = useState<ComparisonMode>("predefined");
  const [month, setMonth] = useState(currentMonthValue);
  const [compareMonth, setCompareMonth] = useState(() =>
    previousMonthValue(currentMonthValue()),
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CategoryComparison | null>(null);
  const [queriedPeriodType, setQueriedPeriodType] =
    useState<PeriodType>("MONTH");

  const monthLabel = result
    ? formatPeriodLabel(
        queriedPeriodType,
        isoToMonthValue(result.currentPeriodStart),
      )
    : "";
  const compareLabel = result
    ? formatPeriodLabel(
        queriedPeriodType,
        isoToMonthValue(result.previousPeriodStart),
      )
    : "";

  async function handleCompare(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    try {
      const comparison = await fetchCategoryComparison({
        periodType,
        referenceDate: monthToIsoDate(month),
        comparisonDate:
          mode === "custom" ? monthToIsoDate(compareMonth) : undefined,
      });
      setResult(comparison);
      setQueriedPeriodType(periodType);
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
        description="Compare seus gastos e receitas por categoria, período a período."
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
            você gastou e recebeu em cada categoria, por mês, trimestre,
            semestre ou ano, comparado a outro período (ex.: "Alimentação -18%
            em relação ao mês passado").
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

  function renderPeriodPicker(
    label: string,
    value: string,
    onChange: (value: string) => void,
  ) {
    if (periodType === "MONTH") {
      return (
        <Input
          label={label}
          type="month"
          value={value}
          onChange={(event) =>
            onChange(event.target.value || currentMonthValue())
          }
        />
      );
    }

    const year = monthToYear(value);

    if (periodType === "YEAR") {
      return (
        <Input
          label={label}
          type="number"
          inputMode="numeric"
          value={String(year)}
          onChange={(event) => {
            const parsedYear = Number(event.target.value);
            onChange(
              buildMonthValue(
                event.target.value && Number.isFinite(parsedYear)
                  ? parsedYear
                  : new Date().getFullYear(),
                1,
              ),
            );
          }}
        />
      );
    }

    const isQuarter = periodType === "QUARTER";
    const blockIndex = isQuarter
      ? monthToQuarter(value)
      : monthToSemester(value);
    const blockOptions = isQuarter ? QUARTER_OPTIONS : SEMESTER_OPTIONS;
    const blockStartMonth = isQuarter ? quarterStartMonth : semesterStartMonth;

    return (
      <div className="grid grid-cols-2 gap-2">
        <Input
          label={`${label} - Ano`}
          type="number"
          inputMode="numeric"
          value={String(year)}
          onChange={(event) => {
            const parsedYear = Number(event.target.value);
            onChange(
              buildMonthValue(
                event.target.value && Number.isFinite(parsedYear)
                  ? parsedYear
                  : new Date().getFullYear(),
                blockStartMonth(blockIndex),
              ),
            );
          }}
        />
        <Select
          label={isQuarter ? "Trimestre" : "Semestre"}
          value={String(blockIndex)}
          onChange={(event) =>
            onChange(
              buildMonthValue(
                year,
                blockStartMonth(Number(event.target.value)),
              ),
            )
          }
        >
          {blockOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
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
            Nenhum lançamento nesses dois períodos.
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
        description="Compare seus gastos e receitas por categoria entre dois períodos."
      >
        <form onSubmit={handleCompare} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Período"
              value={periodType}
              onChange={(event) =>
                setPeriodType(event.target.value as PeriodType)
              }
            >
              {PERIOD_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Select
              label="Comparar com"
              value={mode}
              onChange={(event) =>
                setMode(event.target.value as ComparisonMode)
              }
            >
              <option value="predefined">Período anterior (automático)</option>
              <option value="custom">Escolher os dois períodos</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {renderPeriodPicker(
              mode === "custom"
                ? "Período para analisar"
                : "Período de referência",
              month,
              setMonth,
            )}

            {mode === "custom" &&
              renderPeriodPicker(
                "Período para comparar",
                compareMonth,
                setCompareMonth,
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
