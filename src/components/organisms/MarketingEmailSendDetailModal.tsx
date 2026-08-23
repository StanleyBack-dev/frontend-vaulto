import { useEffect, useState, type ReactNode } from "react";
import { ExternalLink, Mail, MessageCircle, Pencil } from "lucide-react";
import Button from "@atoms/Button";
import Input from "@atoms/Input";
import Select from "@atoms/Select";
import DataTable from "@/components/organisms/DataTable";
import {
  buildCommissionTable,
  buildMailtoLink,
  buildWhatsAppLink,
  normalizeExternalLink,
  requestUpdateMarketingEmailSendContact,
  MARKETING_EMAIL_CATEGORY_LABELS,
  MARKETING_EMAIL_CATEGORY_OPTIONS,
  type MarketingEmailCategory,
  type MarketingEmailSend,
} from "@/features/marketing-emails";
import {
  PRO_PLAN_FIRST_MONTH_PRICE,
  PRO_PLAN_PRICES,
} from "@/features/billing";
import { colors, radii, typography } from "@/config";
import { useToast } from "../../shared/toast/useToast";
import { formatDateTimeDisplay, formatPhone } from "@/utils/format";

interface MarketingEmailSendDetailModalProps {
  open: boolean;
  send: MarketingEmailSend | null;
  onClose: () => void;
  onUpdated?: (updated: MarketingEmailSend) => void;
}

const DEFAULT_PARTNERSHIP_PERCENTAGE = 20;

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function DetailSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3
      className="text-xs font-semibold uppercase tracking-wide"
      style={{ color: colors.purple[700], fontFamily: typography.fontFamily }}
    >
      {children}
    </h3>
  );
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
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

function DetailLinkField({
  label,
  href,
  icon,
  text,
}: {
  label: string;
  href: string;
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="min-w-0">
      <p
        className="mb-1 text-xs font-semibold uppercase tracking-wide"
        style={{ color: colors.brown[500], fontFamily: typography.fontFamily }}
      >
        {label}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 break-words text-sm font-medium hover:underline"
        style={{ color: colors.purple[700], fontFamily: typography.fontFamily }}
      >
        {icon}
        {text}
      </a>
    </div>
  );
}

export default function MarketingEmailSendDetailModal({
  open,
  send,
  onClose,
  onUpdated,
}: MarketingEmailSendDetailModalProps) {
  const { showSuccess, showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editRecipientName, setEditRecipientName] = useState("");
  const [editCategory, setEditCategory] =
    useState<MarketingEmailCategory>("INFLUENCER");
  const [editRecipientPhone, setEditRecipientPhone] = useState("");
  const [editSocialMediaLink, setEditSocialMediaLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (send) {
      setEditRecipientName(send.recipientName);
      setEditCategory(send.category);
      setEditRecipientPhone(send.recipientPhone ?? "");
      setEditSocialMediaLink(send.socialMediaLink ?? "");
    }
    setIsEditing(false);
  }, [send]);

  if (!open || !send) return null;

  const percentage =
    send.partnershipPercentage ?? DEFAULT_PARTNERSHIP_PERCENTAGE;
  const commissionRows = buildCommissionTable(percentage);

  function handleCancelEdit() {
    if (!send) return;

    setEditRecipientName(send.recipientName);
    setEditCategory(send.category);
    setEditRecipientPhone(send.recipientPhone ?? "");
    setEditSocialMediaLink(send.socialMediaLink ?? "");
    setIsEditing(false);
  }

  async function handleSaveContact() {
    if (!send) return;

    setIsSaving(true);

    try {
      const updated = await requestUpdateMarketingEmailSendContact({
        idMarketingEmailSend: send.idMarketingEmailSend,
        recipientName: editRecipientName,
        category: editCategory,
        recipientPhone: editRecipientPhone || undefined,
        socialMediaLink: editSocialMediaLink || undefined,
      });

      showSuccess("Contato atualizado com sucesso.");
      setIsEditing(false);
      onUpdated?.(updated);
    } catch (error) {
      showError(
        "Não foi possível atualizar",
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setIsSaving(false);
    }
  }

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
            <div className="mb-3 flex items-center justify-between">
              <DetailSectionTitle>Destinatário</DetailSectionTitle>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
                  style={{ color: colors.purple[700] }}
                >
                  <Pencil size={13} />
                  Editar
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Nome"
                    required
                    value={editRecipientName}
                    onChange={(event) =>
                      setEditRecipientName(event.target.value)
                    }
                  />
                  <Select
                    label="Categoria"
                    value={editCategory}
                    onChange={(event) =>
                      setEditCategory(
                        event.target.value as MarketingEmailCategory,
                      )
                    }
                  >
                    {MARKETING_EMAIL_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <DetailLinkField
                  label="E-mail"
                  href={buildMailtoLink(send.recipientEmail)}
                  icon={<Mail size={14} />}
                  text={send.recipientEmail}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Celular"
                    value={editRecipientPhone}
                    onChange={(event) =>
                      setEditRecipientPhone(formatPhone(event.target.value))
                    }
                    placeholder="(11) 91234-5678"
                  />
                  <Input
                    label="Link da rede social"
                    type="url"
                    value={editSocialMediaLink}
                    onChange={(event) =>
                      setEditSocialMediaLink(event.target.value)
                    }
                    placeholder="https://instagram.com/perfil"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSaveContact}
                    loading={isSaving}
                    disabled={!editRecipientName.trim()}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailField label="Nome" value={send.recipientName} />
                <DetailField
                  label="Categoria"
                  value={
                    MARKETING_EMAIL_CATEGORY_LABELS[send.category] ??
                    send.category
                  }
                />
                <DetailLinkField
                  label="E-mail"
                  href={buildMailtoLink(send.recipientEmail)}
                  icon={<Mail size={14} />}
                  text={send.recipientEmail}
                />
                {send.recipientPhone &&
                buildWhatsAppLink(send.recipientPhone) ? (
                  <DetailLinkField
                    label="Celular"
                    href={buildWhatsAppLink(send.recipientPhone) as string}
                    icon={<MessageCircle size={14} />}
                    text={send.recipientPhone}
                  />
                ) : (
                  <DetailField label="Celular" value="—" />
                )}
                {send.socialMediaLink ? (
                  <DetailLinkField
                    label="Rede Social"
                    href={normalizeExternalLink(send.socialMediaLink)}
                    icon={<ExternalLink size={14} />}
                    text={send.socialMediaLink}
                  />
                ) : (
                  <DetailField label="Rede Social" value="—" />
                )}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3">
              <DetailSectionTitle>Envio</DetailSectionTitle>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField
                label="Percentual da parceria"
                value={`${percentage}%`}
              />
              <DetailField label="Enviado por" value={send.sentByAdminName} />
              <DetailField
                label="Enviado em"
                value={formatDateTimeDisplay(send.createdAt)}
              />
              <DetailField label="Assunto" value={send.subject} />
            </div>
          </div>

          <div>
            <div className="mb-3">
              <DetailSectionTitle>
                Valores calculados ({percentage}% de comissão)
              </DetailSectionTitle>
            </div>
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
                  render: (row) =>
                    brlFormatter.format(row.firstMonthCommission),
                },
                {
                  key: "recurringCommission",
                  label: "Comissão mensal após o 1º mês",
                  render: (row) => brlFormatter.format(row.recurringCommission),
                },
              ]}
            />
            <p className="mt-2 text-xs" style={{ color: colors.brown[500] }}>
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
