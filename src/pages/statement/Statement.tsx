import { useMemo, useState } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ExportButtons from "@/components/molecules/ExportButtons";
import SectionCard from "@/components/organisms/SectionCard";
import DataTable, {
  type DataTableColumn,
} from "@/components/organisms/DataTable";
import {
  buildDebtStatementLines,
  currentMonthValue,
  debtStatusLabel,
  fetchDebts,
  formatMonthLabel,
  monthToDueDateRange,
} from "@/features/debts";
import {
  buildIncomeStatementLines,
  fetchIncomes,
  incomeStatusLabel,
} from "@/features/incomes";
import { formatDateDisplay } from "@/utils/format";
import { useToast } from "@/shared/toast/useToast";

const STATEMENT_PAGE_SIZE = 200;

type StatementType = "debts" | "incomes" | "both";

interface UnifiedStatementLine {
  id: string;
  kind: "debt" | "income";
  title: string;
  category: string;
  creditCard?: string;
  installmentLabel: string;
  dueDate: string;
  amountExpected: number;
  amountRealized: number;
  statusLabel: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function toErrorMessage(error: unknown): string | undefined {
  return error instanceof Error && error.message ? error.message : undefined;
}

export default function Statement() {
  const { showError } = useToast();

  const [month, setMonth] = useState(currentMonthValue);
  const [statementType, setStatementType] = useState<StatementType>("debts");
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [lines, setLines] = useState<UnifiedStatementLine[]>([]);

  // The boards/table below must only reflect the month + type that were
  // actually used to build `lines` — not whatever the user has since typed
  // into the filters — otherwise switching the type (or the month) before
  // pressing "Gerar" instantly relabels the still-stale data, showing e.g.
  // income headers over debt rows.
  const [generatedMonth, setGeneratedMonth] = useState(currentMonthValue);
  const [generatedType, setGeneratedType] = useState<StatementType>("debts");

  const monthLabel = useMemo(
    () => formatMonthLabel(generatedMonth),
    [generatedMonth],
  );

  const exportFilters = useMemo(() => {
    const { dueDateFrom, dueDateTo } = monthToDueDateRange(generatedMonth);
    const statementScope: Record<StatementType, string> = {
      debts: "DEBTS",
      incomes: "INCOMES",
      both: "BOTH",
    };

    return {
      dueDateFrom,
      dueDateTo,
      statementScope: statementScope[generatedType],
    };
  }, [generatedMonth, generatedType]);

  async function handleGenerate() {
    const { dueDateFrom, dueDateTo } = monthToDueDateRange(month);
    const typeToGenerate = statementType;

    setLoading(true);

    try {
      const nextLines: UnifiedStatementLine[] = [];

      if (typeToGenerate === "debts" || typeToGenerate === "both") {
        const result = await fetchDebts({
          page: 1,
          limit: STATEMENT_PAGE_SIZE,
          dueDateFrom,
          dueDateTo,
        });

        for (const line of buildDebtStatementLines(
          result.items,
          dueDateFrom,
          dueDateTo,
        )) {
          nextLines.push({
            id: line.idDebtInstallment ?? line.idDebt,
            kind: "debt",
            title: line.title,
            category: line.category,
            creditCard: line.creditCard,
            installmentLabel: line.installmentLabel,
            dueDate: line.dueDate,
            amountExpected: line.amountDue,
            amountRealized: line.amountPaid,
            statusLabel: debtStatusLabel(line.status),
          });
        }
      }

      if (typeToGenerate === "incomes" || typeToGenerate === "both") {
        const result = await fetchIncomes({
          page: 1,
          limit: STATEMENT_PAGE_SIZE,
          dueDateFrom,
          dueDateTo,
        });

        for (const line of buildIncomeStatementLines(
          result.items,
          dueDateFrom,
          dueDateTo,
        )) {
          nextLines.push({
            id: line.idIncomeInstallment ?? line.idIncome,
            kind: "income",
            title: line.title,
            category: line.category,
            installmentLabel: line.installmentLabel,
            dueDate: line.dueDate,
            amountExpected: line.amountDue,
            amountRealized: line.amountReceived,
            statusLabel: incomeStatusLabel(line.status),
          });
        }
      }

      nextLines.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      setLines(nextLines);
      setGeneratedMonth(month);
      setGeneratedType(typeToGenerate);
      setHasGenerated(true);
    } catch (error) {
      showError("Falha ao gerar extrato", toErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const totals = useMemo(() => {
    const debtLines = lines.filter((line) => line.kind === "debt");
    const incomeLines = lines.filter((line) => line.kind === "income");

    const totalDue = debtLines.reduce(
      (sum, line) => sum + line.amountExpected,
      0,
    );
    const totalPaid = debtLines.reduce(
      (sum, line) => sum + line.amountRealized,
      0,
    );
    const totalExpectedIncome = incomeLines.reduce(
      (sum, line) => sum + line.amountExpected,
      0,
    );
    const totalReceived = incomeLines.reduce(
      (sum, line) => sum + line.amountRealized,
      0,
    );

    return {
      totalDue,
      totalPaid,
      totalExpectedIncome,
      totalReceived,
      // Balance always reflects money that actually moved — received
      // income against paid debts — never the merely expected/due amounts,
      // matching the same rule used on the dashboard.
      balance: totalReceived - totalPaid,
    };
  }, [lines]);

  const columns = useMemo<DataTableColumn<UnifiedStatementLine>[]>(() => {
    const amountExpectedLabel =
      generatedType === "debts" ? "Valor devido" : "Valor esperado";
    const amountRealizedLabel =
      generatedType === "debts"
        ? "Valor pago"
        : generatedType === "incomes"
          ? "Valor recebido"
          : "Valor realizado";

    const base: DataTableColumn<UnifiedStatementLine>[] = [
      {
        key: "dueDate",
        label: "Vencimento",
        render: (line) => (
          <span className="text-sm text-[#4a3f6b]">
            {formatDateDisplay(line.dueDate)}
          </span>
        ),
      },
    ];

    if (generatedType === "both") {
      base.push({
        key: "kind",
        label: "Tipo",
        render: (line) => (
          <span className="text-sm text-[#5a4e7a]">
            {line.kind === "debt" ? "Dívida" : "Receita"}
          </span>
        ),
      });
    }

    base.push(
      {
        key: "title",
        label: generatedType === "incomes" ? "Receita" : "Título",
        render: (line) => (
          <span className="text-sm font-semibold text-[#1a1333]">
            {line.title}
          </span>
        ),
      },
      {
        key: "category",
        label: "Categoria",
        render: (line) => (
          <span className="text-sm text-[#5a4e7a]">{line.category}</span>
        ),
      },
    );

    if (generatedType === "debts") {
      base.push({
        key: "creditCard",
        label: "Cartão",
        render: (line) => (
          <span className="text-sm text-[#5a4e7a]">
            {line.creditCard || "-"}
          </span>
        ),
      });
    }

    base.push(
      {
        key: "installmentLabel",
        label: "Parcela",
        render: (line) => (
          <span className="text-sm text-[#5a4e7a]">
            {line.installmentLabel}
          </span>
        ),
      },
      {
        key: "amountExpected",
        label: amountExpectedLabel,
        render: (line) => (
          <span className="text-sm font-semibold text-[#1a1333]">
            {formatCurrency(line.amountExpected)}
          </span>
        ),
      },
      {
        key: "amountRealized",
        label: amountRealizedLabel,
        render: (line) => (
          <span className="text-sm text-emerald-700">
            {formatCurrency(line.amountRealized)}
          </span>
        ),
      },
      {
        key: "balance",
        label: "Saldo",
        render: (line) => (
          <span className="text-sm text-[#5a4e7a]">
            {formatCurrency(
              Math.max(line.amountExpected - line.amountRealized, 0),
            )}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (line) => (
          <span className="text-sm text-[#4a3f6b]">{line.statusLabel}</span>
        ),
      },
    );

    return base;
  }, [generatedType]);

  const emptyMessage =
    generatedType === "debts"
      ? "Nenhuma parcela ou dívida com vencimento neste período."
      : generatedType === "incomes"
        ? "Nenhuma parcela ou receita com vencimento neste período."
        : "Nenhuma parcela, dívida ou receita com vencimento neste período.";

  return (
    <div className="space-y-4">
      <SectionCard
        title="Extrato"
        description="Gere um extrato detalhado de dívidas, receitas ou ambas com vencimento no período escolhido."
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px]">
            <Input
              label="Mês de referência"
              type="month"
              value={month}
              onChange={(event) =>
                setMonth(event.target.value || currentMonthValue())
              }
            />
          </div>
          <div className="min-w-[180px]">
            <Select
              label="Tipo de extrato"
              value={statementType}
              onChange={(event) =>
                setStatementType(event.target.value as StatementType)
              }
            >
              <option value="debts">Dívidas</option>
              <option value="incomes">Receitas</option>
              <option value="both">Ambas</option>
            </Select>
          </div>
          <Button
            type="button"
            variant="primary"
            loading={loading}
            onClick={() => {
              void handleGenerate();
            }}
          >
            Gerar
          </Button>
        </div>
      </SectionCard>

      {hasGenerated && (
        <>
          <div
            className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${
              generatedType === "both" ? "lg:grid-cols-4" : ""
            }`}
          >
            {(generatedType === "debts" || generatedType === "both") && (
              <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
                <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                  Total devido em {monthLabel}
                </p>
                <p className="mt-1 text-lg font-bold text-[#f7f5ff]">
                  {formatCurrency(totals.totalDue)}
                </p>
              </div>
            )}
            {(generatedType === "debts" || generatedType === "both") && (
              <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
                <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                  Total pago
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-300">
                  {formatCurrency(totals.totalPaid)}
                </p>
              </div>
            )}
            {generatedType === "incomes" && (
              <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
                <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                  Total esperado em {monthLabel}
                </p>
                <p className="mt-1 text-lg font-bold text-[#f7f5ff]">
                  {formatCurrency(totals.totalExpectedIncome)}
                </p>
              </div>
            )}
            {(generatedType === "incomes" || generatedType === "both") && (
              <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
                <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                  Total recebido
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-300">
                  {formatCurrency(totals.totalReceived)}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
              <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                {generatedType === "both" ? "Saldo do período" : "Saldo"}
              </p>
              <p
                className="mt-1 text-lg font-bold"
                style={{
                  color:
                    generatedType === "both"
                      ? totals.balance >= 0
                        ? "#6ee7b7"
                        : "#fda4af"
                      : "#f59e0b",
                }}
              >
                {formatCurrency(
                  generatedType === "both"
                    ? totals.balance
                    : generatedType === "debts"
                      ? Math.max(totals.totalDue - totals.totalPaid, 0)
                      : Math.max(
                          totals.totalExpectedIncome - totals.totalReceived,
                          0,
                        ),
                )}
              </p>
            </div>
          </div>

          <SectionCard
            title="Movimentações do período"
            description={`Detalhamento de ${monthLabel}, ordenado por vencimento.`}
            action={
              <ExportButtons resource="statement" filters={exportFilters} />
            }
          >
            <DataTable
              data={lines}
              columns={columns}
              getId={(line) => `${line.kind}-${line.id}`}
              emptyMessage={emptyMessage}
            />
          </SectionCard>
        </>
      )}
    </div>
  );
}
