import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/api/billing/schema";
import { colors, radii, typography } from "../../config";

interface PlanBadgeProps {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  className?: string;
}

function resolveBadge(plan: SubscriptionPlan, status: SubscriptionStatus) {
  if (status === "PAST_DUE") {
    return {
      label: "Pagamento pendente",
      background: "#fef3c7",
      color: "#b45309",
    };
  }

  if (status === "CANCELED" || status === "EXPIRED") {
    return {
      label: "Cancelado",
      background: colors.brown[100],
      color: colors.brown[500],
    };
  }

  if (plan === "PRO" && status === "TRIALING") {
    return {
      label: "Pro · teste grátis",
      background: `${colors.purple[500]}1f`,
      color: colors.purple[700],
    };
  }

  if (plan === "PRO") {
    return {
      label: "Vaulto Pro",
      background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
      color: "#fff",
    };
  }

  return {
    label: "Free",
    background: colors.brown[100],
    color: colors.brown[500],
  };
}

export default function PlanBadge({
  plan,
  status,
  className = "",
}: PlanBadgeProps) {
  const badge = resolveBadge(plan, status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}
      style={{
        background: badge.background,
        color: badge.color,
        borderRadius: radii.full,
        fontFamily: typography.fontFamily,
      }}
    >
      {badge.label}
    </span>
  );
}
