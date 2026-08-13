import { useEffect, useState } from "react";
import { LifeBuoy, Send } from "lucide-react";
import Button from "@atoms/Button";
import Select from "@atoms/Select";
import Textarea from "@atoms/Textarea";
import SupportCooldownNotice from "@molecules/SupportCooldownNotice";
import SectionCard from "@/components/organisms/SectionCard";
import {
  fetchMySupportMessageStatus,
  requestSendSupportMessage,
} from "@/features/support";
import type { SupportCategory } from "@/features/support";
import { colors } from "@/config";
import { useToast } from "../shared/toast/useToast";

const SUPPORT_CATEGORY_OPTIONS: Array<{
  value: SupportCategory;
  label: string;
}> = [
  { value: "DOUBT", label: "Dúvida" },
  { value: "TECHNICAL_ISSUE", label: "Problema técnico / Bug" },
  { value: "SUGGESTION", label: "Sugestão" },
  { value: "BILLING", label: "Financeiro / Cobrança" },
  { value: "OTHER", label: "Outro" },
];

function toErrorMessage(error: unknown): string | undefined {
  return error instanceof Error && error.message ? error.message : undefined;
}

export default function Support() {
  const { showSuccess, showError } = useToast();
  const [category, setCategory] = useState<SupportCategory>("DOUBT");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [nextAllowedAt, setNextAllowedAt] = useState<Date | null>(null);
  const isCooldownActive = nextAllowedAt !== null;

  useEffect(() => {
    let isMounted = true;

    fetchMySupportMessageStatus()
      .then((status) => {
        if (isMounted && !status.canSend && status.nextAllowedAt) {
          setNextAllowedAt(new Date(status.nextAllowedAt));
        }
      })
      .catch(() => {
        // Backend is the source of truth for the daily limit anyway — if the
        // check fails, fall back to letting the user try and surfacing the
        // real error from the send attempt instead of blocking the page.
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingStatus(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit() {
    if (!message.trim()) {
      showError(
        "Escreva uma mensagem",
        "Conte o que você precisa antes de enviar.",
      );
      return;
    }

    setIsSending(true);

    try {
      await requestSendSupportMessage({ category, message: message.trim() });
      showSuccess(
        "Mensagem enviada",
        "Recebemos sua mensagem e nossa equipe vai te responder por e-mail.",
      );
      setMessage("");
      setCategory("DOUBT");

      const status = await fetchMySupportMessageStatus();
      if (!status.canSend && status.nextAllowedAt) {
        setNextAllowedAt(new Date(status.nextAllowedAt));
      }
    } catch (error) {
      showError("Não foi possível enviar sua mensagem", toErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Falar com o suporte"
        description="Escolha uma categoria e conte o que você precisa. Você pode enviar 1 mensagem por dia."
      >
        <div className="flex items-start gap-3 rounded-xl border border-[#3a2f5e] bg-[#141225] px-4 py-3">
          <LifeBuoy
            size={18}
            style={{ color: colors.gold[500] }}
            className="mt-0.5 shrink-0"
          />
          <p className="text-sm" style={{ color: colors.brown[500] }}>
            Sua mensagem é enviada por e-mail para a nossa equipe, e você também
            recebe uma confirmação no seu e-mail cadastrado.
          </p>
        </div>

        {nextAllowedAt && (
          <div className="mt-4">
            <SupportCooldownNotice
              nextAllowedAt={nextAllowedAt}
              onExpire={() => setNextAllowedAt(null)}
            />
          </div>
        )}

        <div className="mt-4 space-y-4">
          <Select
            label="Categoria"
            value={category}
            disabled={isCheckingStatus || isCooldownActive}
            onChange={(event) =>
              setCategory(event.target.value as SupportCategory)
            }
          >
            {SUPPORT_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Textarea
            label="Mensagem"
            rows={6}
            value={message}
            disabled={isCheckingStatus || isCooldownActive}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Descreva sua dúvida, problema ou sugestão..."
          />

          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              leftIcon={<Send size={16} />}
              loading={isSending}
              disabled={isSending || isCheckingStatus || isCooldownActive}
              onClick={() => {
                void handleSubmit();
              }}
            >
              Enviar mensagem
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
