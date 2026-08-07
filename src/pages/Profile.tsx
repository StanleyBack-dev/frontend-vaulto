import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionCard from "@/components/organisms/SectionCard";
import ProfileSummaryCard from "@molecules/ProfileSummaryCard";
import SubscriptionStatusCard from "@molecules/SubscriptionStatusCard";
import Loading from "@atoms/Loading";
import type { User } from "@/api/users/schema";
import { fetchMyProfile } from "@/features/users";
import { useBillingContext } from "@/features/billing";
import { planRoutePaths } from "@/router/navigation";
import { useToast } from "../shared/toast/useToast";

export default function Profile() {
  const navigate = useNavigate();
  const { subscription, isLoading: isSubscriptionLoading } =
    useBillingContext();
  const { showError } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchMyProfile()
      .then((result) => {
        if (!cancelled) setUser(result);
      })
      .catch((error) => {
        if (!cancelled) {
          showError(
            "Erro ao carregar perfil",
            error instanceof Error
              ? error.message
              : "Não foi possível carregar seus dados.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingUser(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showError]);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Seus dados"
        description="Informações da sua conta no Vaulto."
      >
        {isLoadingUser || !user ? (
          <Loading label="Carregando seus dados..." />
        ) : (
          <ProfileSummaryCard user={user} subscription={subscription} />
        )}
      </SectionCard>

      {!isSubscriptionLoading && subscription && (
        <SectionCard
          title="Assinatura"
          description="Seu plano atual no Vaulto."
        >
          <SubscriptionStatusCard
            subscription={subscription}
            onViewPlans={() => navigate(planRoutePaths.list)}
          />
        </SectionCard>
      )}
    </div>
  );
}
