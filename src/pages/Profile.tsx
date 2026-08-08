import { useEffect, useState } from "react";
import { CircleOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionCard from "@/components/organisms/SectionCard";
import BillingPaymentHistoryTable from "@/components/organisms/BillingPaymentHistoryTable";
import ProfileSummaryCard from "@molecules/ProfileSummaryCard";
import SubscriptionStatusCard from "@molecules/SubscriptionStatusCard";
import ConfirmDialog from "@molecules/ConfirmDialog";
import Loading from "@atoms/Loading";
import type { User } from "@/api/users/schema";
import { fetchMyProfile } from "@/features/users";
import {
  requestCancelSubscription,
  useBillingContext,
} from "@/features/billing";
import { planRoutePaths } from "@/router/navigation";
import { useToast } from "../shared/toast/useToast";

export default function Profile() {
  const navigate = useNavigate();
  const {
    subscription,
    isLoading: isSubscriptionLoading,
    refresh,
  } = useBillingContext();
  const { showError, showSuccess } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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

  async function handleConfirmCancel() {
    setIsCancelling(true);

    try {
      await requestCancelSubscription();
      await refresh();
      showSuccess(
        "Assinatura cancelada",
        "Sua assinatura foi cancelada e não será renovada.",
      );
      setIsCancelDialogOpen(false);
    } catch (error) {
      showError(
        "Não foi possível cancelar",
        error instanceof Error
          ? error.message
          : "Tente novamente em instantes.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

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
            onCancelSubscription={() => setIsCancelDialogOpen(true)}
          />
        </SectionCard>
      )}

      <SectionCard
        title="Histórico de pagamentos"
        description="Cobranças da sua assinatura Vaulto Pro."
      >
        <BillingPaymentHistoryTable />
      </SectionCard>

      <ConfirmDialog
        open={isCancelDialogOpen}
        title="Cancelar assinatura"
        description="Você continuará com acesso ao Vaulto Pro até o fim do período já pago, mas a assinatura não será renovada. Deseja continuar?"
        confirmLabel="Cancelar assinatura"
        cancelLabel="Manter assinatura"
        variant="danger"
        icon={<CircleOff size={20} />}
        loading={isCancelling}
        onConfirm={() => {
          void handleConfirmCancel();
        }}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
    </div>
  );
}
