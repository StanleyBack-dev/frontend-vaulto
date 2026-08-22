import { useCallback, useEffect, useState } from "react";
import { Eye, FileSpreadsheet } from "lucide-react";
import DataTable, {
  type DataTableColumn,
} from "@/components/organisms/DataTable";
import MarketingEmailSendDetailModal from "@/components/organisms/MarketingEmailSendDetailModal";
import SectionCard from "@/components/organisms/SectionCard";
import Button from "@atoms/Button";
import Input from "@atoms/Input";
import Loading from "@atoms/Loading";
import Select from "@atoms/Select";
import Textarea from "@atoms/Textarea";
import {
  fetchMarketingEmailDefaultTemplate,
  fetchMarketingEmailRecipientCooldown,
  fetchMarketingEmailSends,
  requestMarketingEmailPreview,
  requestMarketingEmailSendsExport,
  requestSendMarketingEmail,
  MARKETING_EMAIL_CATEGORY_LABELS,
  MARKETING_EMAIL_CATEGORY_OPTIONS,
  type MarketingEmailCategory,
  type MarketingEmailSend,
} from "@/features/marketing-emails";
import { useToast } from "../../shared/toast/useToast";
import { colors } from "@/config";
import { downloadBase64File } from "@/utils/file";
import { formatDateTimeDisplay, formatPhone } from "@/utils/format";

const PREVIEW_DEBOUNCE_MS = 400;
const COOLDOWN_CHECK_DEBOUNCE_MS = 500;
const DEFAULT_PARTNERSHIP_PERCENTAGE = 20;

function isLikelyEmail(value: string): boolean {
  return /\S+@\S+\.\S+/.test(value);
}

export default function AdminMarketingEmailsTab() {
  const { showSuccess, showError } = useToast();

  const [category, setCategory] = useState<MarketingEmailCategory>("INFLUENCER");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [partnershipPercentage, setPartnershipPercentage] = useState(
    DEFAULT_PARTNERSHIP_PERCENTAGE,
  );
  const [isLoadingDefault, setIsLoadingDefault] = useState(true);

  const [previewHtml, setPreviewHtml] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [cooldownBlocked, setCooldownBlocked] = useState(false);
  const [cooldownNextAllowedAt, setCooldownNextAllowedAt] = useState<
    string | null
  >(null);

  const [historyItems, setHistoryItems] = useState<MarketingEmailSend[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<
    MarketingEmailCategory | ""
  >("");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSend, setSelectedSend] = useState<MarketingEmailSend | null>(
    null,
  );

  useEffect(() => {
    fetchMarketingEmailDefaultTemplate()
      .then((template) => {
        setSubject(template.subject);
        setBodyMarkdown(template.bodyMarkdown);
      })
      .catch(() => {
        // The compose form still works with an empty template — the admin
        // can just type the e-mail from scratch if this fails.
      })
      .finally(() => setIsLoadingDefault(false));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      requestMarketingEmailPreview({
        subject,
        bodyMarkdown,
        recipientName: recipientName || undefined,
        partnershipPercentage,
      })
        .then((result) => setPreviewHtml(result.html))
        .catch(() => {
          // Keep the last successful preview on screen instead of blanking it.
        });
    }, PREVIEW_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [subject, bodyMarkdown, recipientName, partnershipPercentage]);

  useEffect(() => {
    if (!isLikelyEmail(recipientEmail)) {
      setCooldownBlocked(false);
      setCooldownNextAllowedAt(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      fetchMarketingEmailRecipientCooldown(recipientEmail)
        .then((result) => {
          setCooldownBlocked(result.blocked);
          setCooldownNextAllowedAt(result.nextAllowedAt ?? null);
        })
        .catch(() => {
          setCooldownBlocked(false);
          setCooldownNextAllowedAt(null);
        });
    }, COOLDOWN_CHECK_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [recipientEmail]);

  const loadHistory = useCallback(() => {
    setHistoryLoading(true);

    fetchMarketingEmailSends({
      category: historyCategoryFilter || undefined,
      limit: 50,
    })
      .then((result) => setHistoryItems(result.items))
      .catch(() => setHistoryItems([]))
      .finally(() => setHistoryLoading(false));
  }, [historyCategoryFilter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleSend() {
    setIsSending(true);

    try {
      await requestSendMarketingEmail({
        category,
        recipientEmail,
        recipientName,
        recipientPhone: recipientPhone || undefined,
        subject,
        bodyMarkdown,
        partnershipPercentage,
      });

      showSuccess(
        "E-mail enviado",
        `Proposta de parceria enviada para ${recipientEmail}.`,
      );
      setRecipientName("");
      setRecipientEmail("");
      setRecipientPhone("");
      setCooldownBlocked(false);
      setCooldownNextAllowedAt(null);
      loadHistory();
    } catch (error) {
      showError(
        "Não foi possível enviar",
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);

    try {
      const file = await requestMarketingEmailSendsExport({
        category: historyCategoryFilter || undefined,
      });
      downloadBase64File(file.base64, file.filename, file.mimeType);
    } catch (error) {
      showError(
        "Não foi possível exportar",
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setIsExporting(false);
    }
  }

  const canSend =
    !isSending &&
    !cooldownBlocked &&
    recipientEmail.trim().length > 0 &&
    recipientName.trim().length > 0 &&
    subject.trim().length > 0 &&
    bodyMarkdown.trim().length > 0 &&
    !Number.isNaN(partnershipPercentage) &&
    partnershipPercentage >= 0;

  const columns: DataTableColumn<MarketingEmailSend>[] = [
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setSelectedSend(row);
          }}
          aria-label={`Ver detalhes do envio para ${row.recipientEmail}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
          style={{ color: colors.purple[700] }}
        >
          <Eye size={16} />
        </button>
      ),
    },
    { key: "recipientName", label: "Nome" },
    { key: "recipientEmail", label: "E-mail" },
    {
      key: "recipientPhone",
      label: "Celular",
      render: (row) => row.recipientPhone || "—",
    },
    {
      key: "category",
      label: "Categoria",
      render: (row) => MARKETING_EMAIL_CATEGORY_LABELS[row.category] ?? row.category,
    },
    { key: "subject", label: "Assunto" },
    {
      key: "partnershipPercentage",
      label: "% Parceria",
      render: (row) =>
        typeof row.partnershipPercentage === "number"
          ? `${row.partnershipPercentage}%`
          : "—",
    },
    {
      key: "createdAt",
      label: "Enviado em",
      render: (row) => formatDateTimeDisplay(row.createdAt),
    },
    { key: "sentByAdminName", label: "Enviado por" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Novo envio">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Categoria"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as MarketingEmailCategory)
                }
              >
                {MARKETING_EMAIL_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Input
                label="% da parceria"
                type="number"
                min={0}
                max={100}
                step={0.5}
                required
                value={partnershipPercentage}
                onChange={(event) =>
                  setPartnershipPercentage(Number(event.target.value))
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nome do destinatário"
                required
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
              />
              <Input
                label="Celular"
                value={recipientPhone}
                onChange={(event) =>
                  setRecipientPhone(formatPhone(event.target.value))
                }
                placeholder="(11) 91234-5678"
              />
            </div>

            <Input
              label="E-mail do destinatário"
              type="email"
              required
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
            />

            {cooldownBlocked && (
              <p
                className="rounded-lg px-3 py-2 text-xs font-medium"
                style={{
                  background: "rgba(180,35,63,0.08)",
                  color: colors.red[500],
                }}
              >
                Já enviamos um e-mail de parceria para esse contato nos
                últimos 7 dias
                {cooldownNextAllowedAt
                  ? ` — só será possível reenviar a partir de ${formatDateTimeDisplay(cooldownNextAllowedAt)}.`
                  : "."}
              </p>
            )}

            <Input
              label="Assunto"
              required
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />

            <Textarea
              label="Mensagem"
              required
              rows={18}
              value={bodyMarkdown}
              onChange={(event) => setBodyMarkdown(event.target.value)}
              disabled={isLoadingDefault}
            />

            <Button
              type="button"
              onClick={handleSend}
              loading={isSending}
              disabled={!canSend}
              className="w-full"
            >
              Enviar e-mail
            </Button>
          </div>
        </SectionCard>

        <SectionCard
          title="Preview"
          description="Como o e-mail vai chegar para o destinatário."
        >
          <div
            className="overflow-hidden rounded-lg border"
            style={{ borderColor: colors.brown[100] }}
          >
            <iframe
              title="Preview do e-mail de parceria"
              srcDoc={previewHtml}
              sandbox=""
              className="h-[720px] w-full bg-white"
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Histórico de envios"
        action={
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={<FileSpreadsheet size={14} />}
            onClick={handleExport}
            loading={isExporting}
          >
            Excel
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="max-w-xs">
            <Select
              label="Categoria"
              value={historyCategoryFilter}
              onChange={(event) =>
                setHistoryCategoryFilter(
                  event.target.value as MarketingEmailCategory | "",
                )
              }
            >
              <option value="">Todas</option>
              {MARKETING_EMAIL_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loading />
            </div>
          ) : (
            <DataTable
              data={historyItems}
              columns={columns}
              getId={(row) => row.idMarketingEmailSend}
              emptyMessage="Nenhum e-mail enviado ainda."
            />
          )}
        </div>
      </SectionCard>

      <MarketingEmailSendDetailModal
        open={selectedSend !== null}
        send={selectedSend}
        onClose={() => setSelectedSend(null)}
      />
    </div>
  );
}
