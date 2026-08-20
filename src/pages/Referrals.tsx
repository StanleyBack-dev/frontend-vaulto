import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Gift,
  Instagram,
  MessageCircle,
  Send,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionCard from "@/components/organisms/SectionCard";
import Button from "@atoms/Button";
import Input from "@atoms/Input";
import Loading from "@atoms/Loading";
import { SendReferralInvitePayloadSchema } from "@/api/referrals/schema";
import type { ReferralStats, ReferredUser } from "@/api/referrals/schema";
import {
  fetchMyReferrals,
  fetchMyReferralStats,
  sendMyReferralInvite,
} from "@/features/referrals";
import { settingsRoutePaths } from "@/router/navigation";
import { colors } from "@/config";
import { formatCurrencyFromCents, formatDateDisplay } from "@/utils/format";
import { useToast } from "@/shared/toast/useToast";

export default function Referrals() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEmailError, setInviteEmailError] = useState<string | null>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchMyReferralStats()
      .then((result) => {
        if (!cancelled) setStats(result);
      })
      .catch((error) => {
        if (!cancelled) {
          showError(
            "Erro ao carregar",
            error instanceof Error
              ? error.message
              : "Não foi possível carregar seus dados de indicação.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showError]);

  useEffect(() => {
    let cancelled = false;

    fetchMyReferrals()
      .then((result) => {
        if (!cancelled) setReferrals(result);
      })
      .catch(() => {
        // Silent — the referred-friends list is secondary; an isolated
        // failure here shouldn't block the rest of the page.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCopyLink() {
    if (!stats) return;

    const link = `${window.location.origin}/?ref=${stats.referralCode}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      showSuccess("Link copiado", "Cole no seu vídeo ou mensagem preferida.");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showError("Não foi possível copiar", "Copie o link manualmente da tela.");
    }
  }

  function buildShareMessage(link: string) {
    return `Estou usando o Vaulto pra organizar minhas finanças e recomendo! Assine o Pro com meu link e a gente sai ganhando: ${link}`;
  }

  function handleShareWhatsApp() {
    if (!stats) return;

    const link = `${window.location.origin}/?ref=${stats.referralCode}`;
    const url = `https://wa.me/?text=${encodeURIComponent(buildShareMessage(link))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleShareInstagram() {
    if (!stats) return;

    const link = `${window.location.origin}/?ref=${stats.referralCode}`;

    try {
      await navigator.clipboard.writeText(buildShareMessage(link));
      showSuccess(
        "Mensagem copiada",
        "Cole nos Stories ou numa DM do Instagram pra compartilhar.",
      );
    } catch {
      showError(
        "Não foi possível copiar",
        "Copie o link manualmente pra compartilhar no Instagram.",
      );
    } finally {
      // Instagram has no web share intent that accepts prefilled text like
      // WhatsApp's — this just opens the app/site so the user can paste
      // what was just copied to the clipboard.
      window.open(
        "https://www.instagram.com/",
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  async function handleSendInvite() {
    const parsed = SendReferralInvitePayloadSchema.safeParse({
      email: inviteEmail.trim(),
    });

    if (!parsed.success) {
      setInviteEmailError(parsed.error.issues[0]?.message || "Email inválido.");
      return;
    }

    setInviteEmailError(null);
    setIsSendingInvite(true);

    try {
      await sendMyReferralInvite(parsed.data);
      showSuccess(
        "Convite enviado",
        `Mandamos um email de indicação para ${parsed.data.email}.`,
      );
      setInviteEmail("");
    } catch (error) {
      showError(
        "Não foi possível enviar o convite",
        error instanceof Error
          ? error.message
          : "Tente novamente em instantes.",
      );
    } finally {
      setIsSendingInvite(false);
    }
  }

  const backButton = (
    <Button
      type="button"
      variant="outline"
      className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
      leftIcon={<ArrowLeft size={16} />}
      onClick={() => navigate(settingsRoutePaths.list)}
    >
      Voltar para Configurações
    </Button>
  );

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        {backButton}
        <SectionCard title="Indique e Ganhe">
          <Loading label="Carregando seus dados de indicação..." />
        </SectionCard>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/?ref=${stats.referralCode}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {backButton}
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: colors.brown[100], color: colors.brown[800] }}
        >
          <Wallet size={16} style={{ color: colors.purple[500] }} />
          Saldo: {formatCurrencyFromCents(stats.availableBalanceCents)}
        </div>
      </div>

      <SectionCard
        title="Indique e ganhe"
        description={`Ganhe ${formatCurrencyFromCents(stats.creditAmountCents)} a cada amigo que assinar o Vaulto Pro com o seu código.`}
      >
        <div className="space-y-5">
          <div>
            <p
              className="mb-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: colors.brown[500] }}
            >
              Seu código
            </p>
            <div
              className="inline-block rounded-lg border px-4 py-2 text-lg font-bold tracking-widest"
              style={{
                borderColor: colors.brown[100],
                color: colors.brown[800],
              }}
            >
              {stats.referralCode}
            </div>
          </div>

          <div>
            <p
              className="mb-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: colors.brown[500] }}
            >
              Seu link para compartilhar
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <code
                className="break-all rounded-lg border px-3 py-2 text-sm"
                style={{
                  borderColor: colors.brown[100],
                  color: colors.brown[800],
                  background: "#faf6f2",
                }}
              >
                {referralLink}
              </code>
              <Button
                type="button"
                variant="outline"
                className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                leftIcon={copiedLink ? <Check size={16} /> : <Copy size={16} />}
                onClick={() => {
                  void handleCopyLink();
                }}
              >
                {copiedLink ? "Copiado" : "Copiar link"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="!border-[#25D366] !text-[#128C7E] hover:!bg-[#25D36614]"
                leftIcon={<MessageCircle size={16} />}
                onClick={handleShareWhatsApp}
              >
                WhatsApp
              </Button>
              <Button
                type="button"
                variant="outline"
                className="!border-[#C13584] !text-[#C13584] hover:!bg-[#C1358414]"
                leftIcon={<Instagram size={16} />}
                onClick={() => {
                  void handleShareInstagram();
                }}
              >
                Instagram
              </Button>
            </div>
          </div>

          <div>
            <p
              className="mb-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: colors.brown[500] }}
            >
              Convidar por email
            </p>
            <div className="flex flex-wrap items-start gap-2">
              <div className="min-w-[220px] flex-1">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => {
                    setInviteEmail(event.target.value);
                    if (inviteEmailError) setInviteEmailError(null);
                  }}
                  error={inviteEmailError ?? undefined}
                  placeholder="email@doseuamigo.com"
                />
              </div>
              <Button
                type="button"
                variant="primary"
                leftIcon={<Send size={16} />}
                disabled={isSendingInvite}
                onClick={() => {
                  void handleSendInvite();
                }}
              >
                {isSendingInvite ? "Enviando..." : "Enviar convite"}
              </Button>
            </div>
          </div>

          <div
            className="flex items-start gap-3 rounded-lg border p-4"
            style={{ borderColor: colors.brown[100], background: "#faf6f2" }}
          >
            <Gift
              size={20}
              style={{ color: colors.purple[500], flexShrink: 0 }}
            />
            <p className="text-sm" style={{ color: colors.brown[800] }}>
              {stats.qualifiedReferralsCount === 0
                ? "Compartilhe seu link. Assim que um amigo assinar o Pro, o crédito cai na sua carteira."
                : `${stats.qualifiedReferralsCount} ${stats.qualifiedReferralsCount === 1 ? "amigo já assinou" : "amigos já assinaram"} o Pro com o seu código.`}
            </p>
          </div>
        </div>
      </SectionCard>

      {referrals.length > 0 && (
        <SectionCard
          title="Amigos indicados"
          description="Pessoas que assinaram o Vaulto com o seu código ou link."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b text-left text-xs font-semibold uppercase tracking-wide"
                  style={{
                    borderColor: colors.brown[100],
                    color: colors.brown[500],
                  }}
                >
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr
                    key={referral.email}
                    className="border-b last:border-0"
                    style={{ borderColor: colors.brown[100] }}
                  >
                    <td
                      className="py-2.5 pr-4 font-semibold"
                      style={{ color: colors.brown[800] }}
                    >
                      {referral.name}
                    </td>
                    <td
                      className="py-2.5 pr-4"
                      style={{ color: colors.brown[500] }}
                    >
                      {referral.email}
                    </td>
                    <td className="py-2.5 pr-4">
                      {referral.qualifiedAt ? (
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{ color: "#15803d", background: "#dcfce7" }}
                        >
                          Assinou em {formatDateDisplay(referral.qualifiedAt)}
                        </span>
                      ) : (
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{ color: "#a16207", background: "#fef3c7" }}
                        >
                          Aguardando assinatura
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
