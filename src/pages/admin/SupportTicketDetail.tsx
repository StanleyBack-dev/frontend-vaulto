import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import Button from "@atoms/Button";
import Checkbox from "@atoms/Checkbox";
import Textarea from "@atoms/Textarea";
import SectionCard from "@/components/organisms/SectionCard";
import {
  fetchSupportTicket,
  requestFinalizeSupportTicket,
  requestReplyToSupportTicket,
  type SupportTicket,
} from "@/features/support";
import { adminRoutePaths } from "@/router";
import { useToast } from "@/shared/toast/useToast";
import { colors } from "@/config";

const CATEGORY_LABELS: Record<string, string> = {
  DOUBT: "Dúvida",
  TECHNICAL_ISSUE: "Problema técnico / Bug",
  SUGGESTION: "Sugestão",
  BILLING: "Financeiro / Cobrança",
  OTHER: "Outro",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Aberto",
  ANSWERED: "Respondido",
  RESOLVED: "Finalizado",
};

const DEFAULT_REPLY_MESSAGE =
  "Olá! Obrigado por entrar em contato com o suporte da Vaulto. " +
  "Analisamos sua solicitação e, a partir de agora, ela está sendo tratada pela nossa equipe. " +
  "Qualquer dúvida adicional, é só responder por aqui que estamos à disposição.";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SupportTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [useDefaultReply, setUseDefaultReply] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);

    fetchSupportTicket(id)
      .then((result) => {
        if (isMounted) {
          setTicket(result);
        }
      })
      .catch((error) => {
        if (isMounted) {
          showError(
            "Não foi possível carregar o chamado",
            error instanceof Error ? error.message : undefined,
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleBack() {
    navigate(adminRoutePaths.list, { state: { tab: "tickets" } });
  }

  function handleToggleDefaultReply(checked: boolean) {
    setUseDefaultReply(checked);
    setReply(checked ? DEFAULT_REPLY_MESSAGE : "");
  }

  async function handleReply() {
    if (!ticket || !reply.trim()) {
      showError("Escreva uma resposta", "Conte o que você quer responder.");
      return;
    }

    setIsReplying(true);

    try {
      const updated = await requestReplyToSupportTicket({
        idSupportMessage: ticket.idSupportMessage,
        reply: reply.trim(),
      });
      showSuccess("Resposta enviada", "O usuário foi notificado por e-mail.");
      setReply("");
      setUseDefaultReply(false);
      setTicket(updated);
    } catch (error) {
      showError(
        "Não foi possível enviar a resposta",
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setIsReplying(false);
    }
  }

  async function handleFinalize() {
    if (!ticket) return;

    setIsFinalizing(true);

    try {
      const updated = await requestFinalizeSupportTicket(
        ticket.idSupportMessage,
      );
      showSuccess("Chamado finalizado");
      setTicket(updated);
    } catch (error) {
      showError(
        "Não foi possível finalizar o chamado",
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setIsFinalizing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2"
          style={{
            borderColor: colors.gold[500],
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-4">
        <p className="text-sm" style={{ color: colors.brown[500] }}>
          Chamado não encontrado.
        </p>
        <Button
          type="button"
          variant="outline"
          className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
          leftIcon={<ArrowLeft size={16} />}
          onClick={handleBack}
        >
          Voltar aos chamados
        </Button>
      </div>
    );
  }

  const isResolved = ticket.status === "RESOLVED";
  const canFinalize = ticket.status === "ANSWERED";
  const protocolLabel = `#${String(ticket.protocolNumber).padStart(6, "0")}`;

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="outline"
        className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
        leftIcon={<ArrowLeft size={16} />}
        onClick={handleBack}
      >
        Voltar aos chamados
      </Button>

      <SectionCard
        title={`Chamado ${protocolLabel}`}
        description={`${ticket.userName} (${ticket.userEmail}) — enviado em ${formatDate(ticket.createdAt)}`}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <span
              className="rounded-full px-2.5 py-1"
              style={{
                background: `${colors.gold[500]}1f`,
                color: colors.gold[600] ?? colors.gold[500],
              }}
            >
              {CATEGORY_LABELS[ticket.category] ?? ticket.category}
            </span>
            <span
              className="rounded-full px-2.5 py-1"
              style={{
                background: `${colors.purple[500]}1f`,
                color: colors.purple[700],
              }}
            >
              {STATUS_LABELS[ticket.status] ?? ticket.status}
            </span>
          </div>

          <div>
            <p
              className="mb-1 text-xs font-semibold uppercase tracking-wide"
              style={{ color: colors.brown[500] }}
            >
              Mensagem do usuário
            </p>
            <p
              className="whitespace-pre-wrap text-sm"
              style={{ color: colors.brown[800] }}
            >
              {ticket.message}
            </p>
          </div>

          {ticket.adminReply && (
            <div>
              <p
                className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
                style={{ color: colors.brown[500] }}
              >
                <CheckCircle2 size={14} />
                Resposta enviada
                {ticket.repliedAt ? ` em ${formatDate(ticket.repliedAt)}` : ""}
              </p>
              <p
                className="whitespace-pre-wrap text-sm"
                style={{ color: colors.brown[800] }}
              >
                {ticket.adminReply}
              </p>
            </div>
          )}

          {ticket.finalizedAt && (
            <p
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: colors.brown[500] }}
            >
              <CheckCircle2 size={14} />
              Finalizado por {ticket.finalizedByName ?? "—"} em{" "}
              {formatDate(ticket.finalizedAt)}
            </p>
          )}
        </div>
      </SectionCard>

      {!isResolved && (
        <SectionCard title="Responder chamado">
          <div className="space-y-4">
            <Checkbox
              label="Usar mensagem padrão de resposta"
              checked={useDefaultReply}
              onChange={(event) =>
                handleToggleDefaultReply(event.target.checked)
              }
            />

            <Textarea
              label="Sua resposta"
              rows={6}
              value={reply}
              onChange={(event) => {
                setUseDefaultReply(false);
                setReply(event.target.value);
              }}
              placeholder="Escreva a resposta para o usuário..."
            />

            <div className="flex flex-wrap justify-end gap-3">
              {canFinalize && (
                <Button
                  type="button"
                  variant="outline"
                  className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                  onClick={() => {
                    void handleFinalize();
                  }}
                  loading={isFinalizing}
                  disabled={isReplying || isFinalizing}
                >
                  Finalizar chamado
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                leftIcon={<Send size={16} />}
                onClick={() => {
                  void handleReply();
                }}
                loading={isReplying}
                disabled={isReplying || isFinalizing}
              >
                Enviar resposta
              </Button>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
