import { Crown } from "lucide-react";
import type { Subscription } from "@/api/billing/schema";
import Button from "@atoms/Button";
import { colors, radii, typography } from "../../config";
import { formatDateDisplay } from "../../utils/format";

interface SubscriptionStatusCardProps {
  subscription: Subscription;
  onViewPlans: () => void;
}

function describeStatus(subscription: Subscription): string {
  if (subscription.status === "TRIALING" && subscription.trialEndsAt) {
    return `Seu período de teste do Pro termina em ${formatDateDisplay(subscription.trialEndsAt)}.`;
  }

  if (subscription.status === "PAST_DUE") {
    return "Identificamos um pagamento pendente. Regularize para manter o Pro ativo.";
  }

  if (subscription.status === "CANCELED" || subscription.status === "EXPIRED") {
    return "Sua assinatura Pro não está mais ativa.";
  }

  if (subscription.plan === "PRO" && subscription.currentPeriodEnd) {
    return subscription.cancelAtPeriodEnd
      ? `Seu Pro fica ativo até ${formatDateDisplay(subscription.currentPeriodEnd)} e depois não renova.`
      : `Próxima renovação em ${formatDateDisplay(subscription.currentPeriodEnd)}.`;
  }

  return "Você está no plano Free, com limites de uso. Assine o Pro para liberar tudo.";
}

export default function SubscriptionStatusCard({
  subscription,
  onViewPlans,
}: SubscriptionStatusCardProps) {
  const isPro = subscription.plan === "PRO";

  return (
    <div
      className="flex flex-col items-start gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      style={{ borderColor: colors.brown[100] }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
            color: "#fff",
          }}
        >
          <Crown size={18} />
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{
            color: colors.brown[800],
            fontFamily: typography.fontFamily,
          }}
        >
          {describeStatus(subscription)}
        </p>
      </div>

      <Button
        type="button"
        variant={isPro ? "outline" : "primary"}
        className={
          isPro ? "!border-gray-400 !text-gray-700 hover:!bg-gray-100" : ""
        }
        onClick={onViewPlans}
        style={{ borderRadius: radii.md }}
      >
        {isPro ? "Ver planos" : "Assinar Vaulto Pro"}
      </Button>
    </div>
  );
}
