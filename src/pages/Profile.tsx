import { useEffect, useState } from "react";
import { CircleOff, PowerOff, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionCard from "@/components/organisms/SectionCard";
import BillingPaymentHistoryTable from "@/components/organisms/BillingPaymentHistoryTable";
import ProfileSummaryCard from "@molecules/ProfileSummaryCard";
import SubscriptionStatusCard from "@molecules/SubscriptionStatusCard";
import ConfirmDialog from "@molecules/ConfirmDialog";
import CancellationSurveyFields from "@molecules/CancellationSurveyFields";
import DeactivationSurveyFields from "@molecules/DeactivationSurveyFields";
import DeletionSurveyFields from "@molecules/DeletionSurveyFields";
import Button from "@atoms/Button";
import Loading from "@atoms/Loading";
import type { CancellationReason } from "@/api/billing/schema";
import type {
  AccountDeactivationReason,
  AccountDeletionReason,
} from "@/api/account-lifecycle/schema";
import type { User } from "@/api/users/schema";
import { fetchMyProfile } from "@/features/users";
import {
  requestAccountDeletion,
  requestCancelAccountDeletion,
  requestDeactivateAccount,
} from "@/features/account-lifecycle";
import { ACCOUNT_DELETION_GRACE_PERIOD_DAYS } from "@/features/account-lifecycle/model/constants";
import {
  requestCancelSubscription,
  useBillingContext,
} from "@/features/billing";
import { useAuthSession } from "@/features/auth";
import { authRoutePaths, planRoutePaths } from "@/router/navigation";
import { colors } from "@/config";
import { useToast } from "../shared/toast/useToast";

function formatScheduledDeletionDate(deletionRequestedAt: string): string {
  const requestedAt = new Date(deletionRequestedAt);
  const scheduledFor = new Date(
    requestedAt.getTime() +
      ACCOUNT_DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
  );

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
    scheduledFor,
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { clearSession } = useAuthSession();
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
  const [cancellationReasons, setCancellationReasons] = useState<
    CancellationReason[]
  >([]);
  const [otherCancellationReason, setOtherCancellationReason] = useState("");

  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivationReasons, setDeactivationReasons] = useState<
    AccountDeactivationReason[]
  >([]);
  const [otherDeactivationReason, setOtherDeactivationReason] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const [deletionReasons, setDeletionReasons] = useState<
    AccountDeletionReason[]
  >([]);
  const [otherDeletionReason, setOtherDeletionReason] = useState("");
  const [isCancellingDeletion, setIsCancellingDeletion] = useState(false);

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

  function toggleCancellationReason(reason: CancellationReason) {
    setCancellationReasons((current) =>
      current.includes(reason)
        ? current.filter((value) => value !== reason)
        : [...current, reason],
    );
  }

  function closeCancelDialog() {
    setIsCancelDialogOpen(false);
    setCancellationReasons([]);
    setOtherCancellationReason("");
  }

  async function handleConfirmCancel() {
    if (cancellationReasons.length === 0) {
      showError(
        "Selecione um motivo",
        "Escolha ao menos um motivo para cancelar a assinatura.",
      );
      return;
    }

    setIsCancelling(true);

    try {
      await requestCancelSubscription({
        reasons: cancellationReasons,
        otherReason: otherCancellationReason.trim() || undefined,
      });
      await refresh();
      showSuccess(
        "Assinatura cancelada",
        "Sua assinatura foi cancelada e não será renovada.",
      );
      closeCancelDialog();
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

  function toggleDeactivationReason(reason: AccountDeactivationReason) {
    setDeactivationReasons((current) =>
      current.includes(reason)
        ? current.filter((value) => value !== reason)
        : [...current, reason],
    );
  }

  function closeDeactivateDialog() {
    setIsDeactivateDialogOpen(false);
    setDeactivationReasons([]);
    setOtherDeactivationReason("");
  }

  async function handleConfirmDeactivate() {
    if (deactivationReasons.length === 0) {
      showError(
        "Selecione um motivo",
        "Escolha ao menos um motivo para inativar a conta.",
      );
      return;
    }

    setIsDeactivating(true);

    try {
      await requestDeactivateAccount({
        reasons: deactivationReasons,
        otherReason: otherDeactivationReason.trim() || undefined,
      });
      showSuccess(
        "Conta inativada",
        "Sua conta foi inativada. Faça login novamente quando quiser voltar.",
      );
      closeDeactivateDialog();
      clearSession();
      navigate(authRoutePaths.login, { replace: true });
    } catch (error) {
      showError(
        "Não foi possível inativar a conta",
        error instanceof Error
          ? error.message
          : "Tente novamente em instantes.",
      );
    } finally {
      setIsDeactivating(false);
    }
  }

  function toggleDeletionReason(reason: AccountDeletionReason) {
    setDeletionReasons((current) =>
      current.includes(reason)
        ? current.filter((value) => value !== reason)
        : [...current, reason],
    );
  }

  function closeDeleteDialog() {
    setIsDeleteDialogOpen(false);
    setDeletionReasons([]);
    setOtherDeletionReason("");
  }

  async function handleConfirmDeleteRequest() {
    if (deletionReasons.length === 0) {
      showError(
        "Selecione um motivo",
        "Escolha ao menos um motivo para excluir a conta.",
      );
      return;
    }

    setIsRequestingDeletion(true);

    try {
      await requestAccountDeletion({
        reasons: deletionReasons,
        otherReason: otherDeletionReason.trim() || undefined,
      });
      const refreshed = await fetchMyProfile();
      setUser(refreshed);
      showSuccess(
        "Exclusão solicitada",
        "Enviamos um e-mail com o prazo e como cancelar, caso mude de ideia.",
      );
      closeDeleteDialog();
    } catch (error) {
      showError(
        "Não foi possível solicitar a exclusão",
        error instanceof Error
          ? error.message
          : "Tente novamente em instantes.",
      );
    } finally {
      setIsRequestingDeletion(false);
    }
  }

  async function handleCancelDeletion() {
    setIsCancellingDeletion(true);

    try {
      await requestCancelAccountDeletion();
      const refreshed = await fetchMyProfile();
      setUser(refreshed);
      showSuccess(
        "Exclusão cancelada",
        "Sua conta continua ativa normalmente.",
      );
    } catch (error) {
      showError(
        "Não foi possível cancelar a exclusão",
        error instanceof Error
          ? error.message
          : "Tente novamente em instantes.",
      );
    } finally {
      setIsCancellingDeletion(false);
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

      {!isLoadingUser && user && (
        <SectionCard
          title="Conta"
          description="Inative ou exclua permanentemente sua conta no Vaulto."
        >
          {user.deletionRequestedAt ? (
            <div
              className="space-y-3 rounded-lg border p-4"
              style={{
                borderColor: "#b4233f33",
                background: "#b4233f0d",
              }}
            >
              <p className="text-sm" style={{ color: colors.brown[800] }}>
                Sua conta e seus dados pessoais serão excluídos permanentemente
                em{" "}
                <strong>
                  {formatScheduledDeletionDate(user.deletionRequestedAt)}
                </strong>
                . Você pode cancelar essa solicitação a qualquer momento até lá.
              </p>
              <Button
                type="button"
                variant="outline"
                className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                loading={isCancellingDeletion}
                onClick={() => {
                  void handleCancelDeletion();
                }}
              >
                Cancelar exclusão
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                leftIcon={<PowerOff size={16} />}
                onClick={() => setIsDeactivateDialogOpen(true)}
              >
                Inativar conta
              </Button>
              <Button
                type="button"
                variant="danger"
                leftIcon={<Trash2 size={16} />}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Excluir conta
              </Button>
            </div>
          )}
        </SectionCard>
      )}

      <ConfirmDialog
        open={isCancelDialogOpen}
        title="Cancelar assinatura"
        description={
          <CancellationSurveyFields
            reasons={cancellationReasons}
            onToggleReason={toggleCancellationReason}
            otherReason={otherCancellationReason}
            onOtherReasonChange={setOtherCancellationReason}
          />
        }
        confirmLabel="Enviar e cancelar"
        cancelLabel="Manter assinatura"
        variant="danger"
        icon={<CircleOff size={20} />}
        loading={isCancelling}
        onConfirm={() => {
          void handleConfirmCancel();
        }}
        onCancel={closeCancelDialog}
      />

      <ConfirmDialog
        open={isDeactivateDialogOpen}
        title="Inativar conta"
        description={
          <DeactivationSurveyFields
            reasons={deactivationReasons}
            onToggleReason={toggleDeactivationReason}
            otherReason={otherDeactivationReason}
            onOtherReasonChange={setOtherDeactivationReason}
          />
        }
        confirmLabel="Inativar conta"
        cancelLabel="Manter conta ativa"
        variant="warning"
        icon={<PowerOff size={20} />}
        loading={isDeactivating}
        onConfirm={() => {
          void handleConfirmDeactivate();
        }}
        onCancel={closeDeactivateDialog}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Excluir conta"
        description={
          <DeletionSurveyFields
            reasons={deletionReasons}
            onToggleReason={toggleDeletionReason}
            otherReason={otherDeletionReason}
            onOtherReasonChange={setOtherDeletionReason}
            gracePeriodDays={ACCOUNT_DELETION_GRACE_PERIOD_DAYS}
          />
        }
        confirmLabel="Solicitar exclusão"
        cancelLabel="Manter conta"
        variant="danger"
        icon={<Trash2 size={20} />}
        loading={isRequestingDeletion}
        onConfirm={() => {
          void handleConfirmDeleteRequest();
        }}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
