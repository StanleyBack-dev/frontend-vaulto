import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Crown, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Loading from "@/components/atoms/Loading";
import SectionCard from "@/components/organisms/SectionCard";
import { useBillingContext } from "@/features/billing";
import {
  debtStatusLabel,
  fetchDebts,
  getPaidAmount,
  getRemainingInstallmentsCount as getRemainingDebtInstallmentsCount,
} from "@/features/debts";
import {
  fetchIncomes,
  getReceivedAmount,
  getRemainingInstallmentsCount as getRemainingIncomeInstallmentsCount,
  incomeStatusLabel,
} from "@/features/incomes";
import { planRoutePaths, settingsRoutePaths } from "@/router";
import { formatDateDisplay } from "@/utils/format";
import { colors } from "@/config";
import { useToast } from "../shared/toast/useToast";

const REMINDERS_PAGE_SIZE = 200;

interface ReminderEntry {
  id: string;
  kind: "debt" | "income";
  title: string;
  category: string;
  statusLabel: string;
  amount: number;
  isInstallment: boolean;
  installmentNumber?: number;
  installmentCount?: number;
  remainingInstallments?: number;
  totalAmount?: number;
  paidAmount?: number;
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

function toDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function tomorrowDateValue(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateValue(tomorrow);
}

function toDateOnly(value: string): string {
  return value.slice(0, 10);
}

export default function Reminders() {
  const navigate = useNavigate();
  const { isPro, isLoading: isSubscriptionLoading } = useBillingContext();
  const { showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<ReminderEntry[]>([]);

  const tomorrow = tomorrowDateValue();

  async function loadDueTomorrow() {
    setLoading(true);

    try {
      const [debtsResult, incomesResult] = await Promise.all([
        fetchDebts({
          page: 1,
          limit: REMINDERS_PAGE_SIZE,
          dueDateFrom: tomorrow,
          dueDateTo: tomorrow,
        }),
        fetchIncomes({
          page: 1,
          limit: REMINDERS_PAGE_SIZE,
          dueDateFrom: tomorrow,
          dueDateTo: tomorrow,
        }),
      ]);

      const nextEntries: ReminderEntry[] = [];

      // Every debt/income always has at least one installment row, even a
      // "pagamento único" one (installmentCount 1) — hasInstallments only
      // decides the display style below, never which items match tomorrow.
      for (const debt of debtsResult.items) {
        for (const installment of debt.installments) {
          if (toDateOnly(installment.dueDate) !== tomorrow) continue;
          if (installment.status === "PAID") continue;

          nextEntries.push({
            id: `debt-${installment.idDebtInstallment}`,
            kind: "debt",
            title: debt.title,
            category: debt.category,
            statusLabel: debtStatusLabel(installment.status),
            amount: installment.amountDue,
            isInstallment: debt.hasInstallments,
            installmentNumber: installment.installmentNumber,
            installmentCount: debt.installmentCount ?? debt.installments.length,
            remainingInstallments: getRemainingDebtInstallmentsCount(debt),
            totalAmount: debt.totalAmount,
            paidAmount: getPaidAmount(debt),
          });
        }
      }

      for (const income of incomesResult.items) {
        for (const installment of income.installments) {
          if (toDateOnly(installment.dueDate) !== tomorrow) continue;
          if (installment.status === "RECEIVED") continue;

          nextEntries.push({
            id: `income-${installment.idIncomeInstallment}`,
            kind: "income",
            title: income.title,
            category: income.category,
            statusLabel: incomeStatusLabel(installment.status),
            amount: installment.amountDue,
            isInstallment: income.hasInstallments,
            installmentNumber: installment.installmentNumber,
            installmentCount:
              income.installmentCount ?? income.installments.length,
            remainingInstallments: getRemainingIncomeInstallmentsCount(income),
            totalAmount: income.totalAmount,
            paidAmount: getReceivedAmount(income),
          });
        }
      }

      setEntries(nextEntries);
    } catch (error) {
      showError("Falha ao carregar os lembretes", toErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isPro) {
      void loadDueTomorrow();
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
      <div className="space-y-6">
        <Button
          type="button"
          variant="outline"
          className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(settingsRoutePaths.list)}
        >
          Voltar para Configurações
        </Button>

        <SectionCard
          title="Lembretes"
          description="Nunca mais perca um vencimento."
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
              Os lembretes são um recurso exclusivo do Vaulto Pro. Todo dia,
              avisamos por e-mail o que vence amanhã, para você nunca ser pego
              de surpresa.
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
      </div>
    );
  }

  const debtEntries = entries.filter((entry) => entry.kind === "debt");
  const incomeEntries = entries.filter((entry) => entry.kind === "income");

  function renderEntry(entry: ReminderEntry) {
    const sign = entry.kind === "debt" ? "− " : "+ ";
    const amountColor = entry.kind === "debt" ? "#f87171" : "#6ee7b7";

    return (
      <div
        key={entry.id}
        className="flex items-start justify-between gap-4 rounded-xl border border-[#3a2f5e] bg-[#141225] px-4 py-3"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#f7f5ff]">{entry.title}</p>
          <p className="text-xs text-[#b7afcf]">
            {entry.category} · {entry.statusLabel}
          </p>

          {entry.isInstallment ? (
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#b7afcf] sm:grid-cols-4">
              <span>
                Parcela{" "}
                <strong className="text-[#f7f5ff]">
                  {entry.installmentNumber}/{entry.installmentCount}
                </strong>
              </span>
              <span>
                Restam{" "}
                <strong className="text-[#f7f5ff]">
                  {entry.remainingInstallments}
                </strong>{" "}
                parcela(s)
              </span>
              <span>
                Total:{" "}
                <strong className="text-[#f7f5ff]">
                  {formatCurrency(entry.totalAmount ?? 0)}
                </strong>
              </span>
              <span>
                {entry.kind === "debt" ? "Já pago" : "Já recebido"}:{" "}
                <strong className="text-[#f7f5ff]">
                  {formatCurrency(entry.paidAmount ?? 0)}
                </strong>
              </span>
            </div>
          ) : (
            <p className="mt-2 text-xs" style={{ color: colors.brown[500] }}>
              Pagamento único
            </p>
          )}
        </div>

        <span
          className="whitespace-nowrap text-sm font-bold"
          style={{ color: amountColor }}
        >
          {sign}
          {formatCurrency(entry.amount)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="outline"
        className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
        leftIcon={<ArrowLeft size={16} />}
        onClick={() => navigate(settingsRoutePaths.list)}
      >
        Voltar para Configurações
      </Button>

      <SectionCard
        title="Lembretes por e-mail"
        description="Como avisamos você."
      >
        <div className="flex items-start gap-3 rounded-xl border border-[#3a2f5e] bg-[#141225] px-4 py-3">
          <Mail
            size={18}
            style={{ color: colors.gold[500] }}
            className="mt-0.5 shrink-0"
          />
          <p className="text-sm" style={{ color: colors.brown[500] }}>
            Todo dia, se houver dívidas ou receitas vencendo amanhã, enviamos um
            e-mail com o resumo para o seu endereço cadastrado. Aqui embaixo
            você vê a mesma prévia do que seria enviado.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title={`Vence amanhã (${formatDateDisplay(tomorrow)})`}
        description="Dívidas e receitas com vencimento no dia seguinte."
      >
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loading label="Carregando..." />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Bell size={22} style={{ color: colors.brown[500] }} />
            <p className="text-sm" style={{ color: colors.brown[500] }}>
              Nada vencendo amanhã. Você não receberá lembrete por e-mail hoje.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {debtEntries.length > 0 && (
              <div>
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: colors.brown[500] }}
                >
                  Dívidas a pagar
                </p>
                <div className="space-y-2">
                  {debtEntries.map((entry) => renderEntry(entry))}
                </div>
              </div>
            )}

            {incomeEntries.length > 0 && (
              <div>
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: colors.brown[500] }}
                >
                  Receitas a receber
                </p>
                <div className="space-y-2">
                  {incomeEntries.map((entry) => renderEntry(entry))}
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
