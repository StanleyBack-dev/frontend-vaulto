import type { ReactNode } from "react";
import { Mail } from "lucide-react";
import Button from "@atoms/Button";
import DataTable from "@/components/organisms/DataTable";
import {
  buildCommissionTable,
  MARKETING_EMAIL_CATEGORY_LABELS,
  type MarketingEmailSend,
} from "@/features/marketing-emails";
import { PRO_PLAN_FIRST_MONTH_PRICE, PRO_PLAN_PRICES } from "@/features/billing";
import { colors, radii, typography } from "@/config";
import { formatDateTimeDisplay } from "@/utils/format";

interface MarketingEmailSendDetailModalProps {
  open: boolean;
  send: MarketingEmailSend | null;
  onClose: () => void;
}

const DEFAULT_PARTNERSHIP_PERCENTAGE = 20;

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function DetailSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3
      className="mb-3 text-xs font-semibold uppercase tracking-wide"
      style={{ color: colors.purple[700], fontFamily: typography.fontFamily }}
    >
      {children}
    </h3>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p
        className="mb-1 text-xs font-semibold uppercase tracking-wide"
        style={{ color: colors.brown[500], fontFamily: typography.fontFamily }}
      >
        {label}
      </p>
      <p
        className="break-words text-sm"
        style={{ color: colors.brown[800], fontFamily: typography.fontFamily }}
      >
        {value}
      </p>
    </div>
  );
}

export default function MarketingEmailSendDetailModal({
  open,
  send,
  onClose,
}: MarketingEmailSendDetailModalProps) {
  if (!open || !send) return null;

  const percentage = send.partnershipPercentage ?? DEFAULT_PARTNERSHIP_PERCENTAGE;
  const commissionRows = buildCommissionTable(percentage);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#06050d]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl"
        style={{ borderColor: colors.brown[100], borderRadius: radii.lg }}
      >
        <div
          className="flex items-start gap-4 border-b p-6"
          style={{ borderColor: colors.brown[100] }}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `${colors.gold[500]}1f`,
              color: colors.gold[600],
            }}
          >
            <Mail size={20} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h2
              className="text-base font-bold"
              style={{
                color: colors.brown[800],
                fontFamily: typography.fontFamily,
              }}
            >
              Detalhes do envio
            </h2>
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{
                color: colors.brown[500],
                fontFamily: typography.fontFamily,
              }}
            >
              {send.subject}
            </p>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto p-6">
          <div>
            <DetailSectionTitle>Destinatário</DetailSectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Nome" value={send.recipientName} />
              <DetailField
                label="Categoria"
                value={
                  MARKETING_EMAIL_CATEGORY_LABELS[send.category] ??
                  send.category
                }
              />
              <DetailField label="E-mail" value={send.recipientEmail} />
              <DetailField
                label="Celular"
                value={send.recipientPhone || "—"}
              />
            </div>
          </div>

          <div>
            <DetailSectionTitle>Envio</DetailSectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField
                label="Percentual da parceria"
                value={`${percentage}%`}
              />
              <DetailField
                label="Enviado por"
                value={send.sentByAdminName}
              />
              <DetailField
                label="Enviado em"
                value={formatDateTimeDisplay(send.createdAt)}
              />
              <DetailField label="Assunto" value={send.subject} />
            </div>
          </div>

          <div>
            <DetailSectionTitle>
              Valores calculados ({percentage}% de comissão)
            </DetailSectionTitle>
            <DataTable
              data={commissionRows}
              getId={(row) => row.subscribers}
              columns={[
                {
                  key: "subscribers",
                  label: "Novos assinantes",
                  render: (row) => `${row.subscribers} usuários`,
                },
                {
                  key: "firstMonthCommission",
                  label: "Comissão no 1º mês",
                  render: (row) => brlFormatter.format(row.firstMonthCommission),
                },
                {
                  key: "recurringCommission",
                  label: "Comissão mensal após o 1º mês",
                  render: (row) => brlFormatter.format(row.recurringCommission),
                },
              ]}
            />
            <p
              className="mt-2 text-xs"
              style={{ color: colors.brown[500] }}
            >
              Valores ilustrativos considerando {percentage}% sobre o valor da
              assinatura ({brlFormatter.format(PRO_PLAN_FIRST_MONTH_PRICE)} no
              1º mês / {brlFormatter.format(PRO_PLAN_PRICES.MONTHLY)}{" "}
              recorrente).
            </p>
          </div>
        </div>

        <div
          className="flex justify-end border-t px-6 py-4"
          style={{ borderColor: colors.brown[100] }}
        >
          <Button
            type="button"
            variant="outline"
            className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
