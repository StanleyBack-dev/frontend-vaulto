import { useEffect, useState } from "react";
import { Check, Copy, Gift } from "lucide-react";
import SectionCard from "@/components/organisms/SectionCard";
import Button from "@atoms/Button";
import Loading from "@atoms/Loading";
import type { ReferralStats } from "@/api/referrals/schema";
import { fetchMyReferralStats } from "@/features/referrals";
import { colors } from "@/config";
import { useToast } from "@/shared/toast/useToast";

export default function Referrals() {
  const { showError, showSuccess } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

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

  if (isLoading || !stats) {
    return (
      <SectionCard title="Indique e Ganhe">
        <Loading label="Carregando seus dados de indicação..." />
      </SectionCard>
    );
  }

  const referralLink = `${window.location.origin}/?ref=${stats.referralCode}`;
  const progress = Math.min(
    stats.qualifiedReferralsCount,
    stats.thresholdCount,
  );
  const hasReward = stats.rewardStatus === "APPLIED";
  const rewardPending = stats.rewardStatus === "PENDING";

  return (
    <div className="space-y-6">
      <SectionCard
        title="Indique e ganhe 1 mês grátis de Vaulto Pro"
        description={`A cada ${stats.thresholdCount} amigos que assinarem o Vaulto Pro com o seu código, você ganha 1 mês grátis de Pro.`}
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
            </div>
          </div>

          <div>
            <p
              className="mb-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: colors.brown[500] }}
            >
              Seu progresso
            </p>
            <div className="flex items-center gap-3">
              <div
                className="h-2.5 w-full max-w-xs overflow-hidden rounded-full"
                style={{ background: "#f0e6db" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(progress / stats.thresholdCount) * 100}%`,
                    background: `linear-gradient(to right, ${colors.gold[500]}, ${colors.purple[500]})`,
                  }}
                />
              </div>
              <span
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: colors.brown[800] }}
              >
                {progress} de {stats.thresholdCount}
              </span>
            </div>
          </div>

          <div
            className="flex items-start gap-3 rounded-lg border p-4"
            style={{
              borderColor:
                hasReward || rewardPending ? "#22c55e33" : colors.brown[100],
              background: hasReward || rewardPending ? "#22c55e0d" : "#faf6f2",
            }}
          >
            <Gift
              size={20}
              style={{ color: colors.purple[500], flexShrink: 0 }}
            />
            <p className="text-sm" style={{ color: colors.brown[800] }}>
              {hasReward &&
                "Você já ganhou seu mês grátis de Vaulto Pro. Obrigado por indicar a Vaulto!"}
              {rewardPending &&
                "Você já garantiu o seu mês grátis! Se você já é Pro, ele entra automaticamente quando o seu ciclo atual terminar."}
              {!hasReward &&
                !rewardPending &&
                "Continue indicando amigos — assim que 3 deles assinarem o Vaulto Pro, seu mês grátis é liberado automaticamente."}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
