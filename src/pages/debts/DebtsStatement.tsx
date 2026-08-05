import { useMemo, useState } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
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
  type DebtStatementLine,
} from "@/features/debts";
import { formatDateDisplay } from "@/utils/format";
import { useToast } from "@/shared/toast/useToast";

const STATEMENT_PAGE_SIZE = 200;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function toErrorMessage(error: unknown): string | undefined {
  return error instanceof Error && error.message ? error.message : undefined;
}

export default function DebtsStatement() {
  const { showError } = useToast();

  const [month, setMonth] = useState(currentMonthValue);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [lines, setLines] = useState<DebtStatementLine[]>([]);

  const monthLabel = useMemo(() => formatMonthLabel(month), [month]);

  async function handleGenerate() {
    const { dueDateFrom, dueDateTo } = monthToDueDateRange(month);

    setLoading(true);

    try {
      const result = await fetchDebts({
        page: 1,
        limit: STATEMENT_PAGE_SIZE,
        dueDateFrom,
        dueDateTo,
      });

      setLines(buildDebtStatementLines(result.items, dueDateFrom, dueDateTo));
      setHasGenerated(true);
    } catch (error) {
      showError("Falha ao gerar extrato", toErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const totals = useMemo(() => {
    const amountDue = lines.reduce((sum, line) => sum + line.amountDue, 0);
    const amountPaid = lines.reduce((sum, line) => sum + line.amountPaid, 0);

    return {
      amountDue,
      amountPaid,
      balance: Math.max(amountDue - amountPaid, 0),
    };
  }, [lines]);

  const columns = useMemo<DataTableColumn<DebtStatementLine>[]>(
    () => [
      {
        key: "dueDate",
        label: "Vencimento",
        render: (line) => (
          <span className="text-sm text-[#4a3f6b]">
            {formatDateDisplay(line.dueDate)}
          </span>
        ),
      },
      {
        key: "title",
        label: "Dívida",
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
      {
        key: "creditCard",
        label: "Cartão",
        render: (line) => (
          <span className="text-sm text-[#5a4e7a]">
            {line.creditCard || "-"}
          </span>
        ),
      },
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
        key: "amountDue",
        label: "Valor devido",
        render: (line) => (
          <span className="text-sm font-semibold text-[#1a1333]">
            {formatCurrency(line.amountDue)}
          </span>
        ),
      },
      {
        key: "amountPaid",
        label: "Valor pago",
        render: (line) => (
          <span className="text-sm text-emerald-700">
            {formatCurrency(line.amountPaid)}
          </span>
        ),
      },
      {
        key: "balance",
        label: "Saldo",
        render: (line) => (
          <span className="text-sm text-[#5a4e7a]">
            {formatCurrency(Math.max(line.amountDue - line.amountPaid, 0))}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (line) => (
          <span className="text-sm text-[#4a3f6b]">
            {debtStatusLabel(line.status)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <SectionCard
        title="Extrato de dívidas"
        description="Gere um extrato detalhado com todas as parcelas e dívidas com vencimento no período escolhido."
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
              <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                Total devido em {monthLabel}
              </p>
              <p className="mt-1 text-lg font-bold text-[#f7f5ff]">
                {formatCurrency(totals.amountDue)}
              </p>
            </div>
            <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
              <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                Total pago
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-300">
                {formatCurrency(totals.amountPaid)}
              </p>
            </div>
            <div className="rounded-xl border border-[#3a2f5e] bg-[#141225] p-4">
              <p className="text-xs uppercase tracking-wide text-[#b7afcf]">
                Saldo
              </p>
              <p className="mt-1 text-lg font-bold text-amber-300">
                {formatCurrency(totals.balance)}
              </p>
            </div>
          </div>

          <SectionCard
            title="Parcelas e dívidas do período"
            description={`Detalhamento de ${monthLabel}, ordenado por vencimento.`}
          >
            <DataTable
              data={lines}
              columns={columns}
              getId={(line) => line.idDebtInstallment ?? line.idDebt}
              emptyMessage="Nenhuma parcela ou dívida com vencimento neste período."
            />
          </SectionCard>
        </>
      )}
    </div>
  );
}
