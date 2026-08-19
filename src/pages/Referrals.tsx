import { useEffect, useState } from "react";
import { ArrowLeft, Banknote, Check, Copy, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionCard from "@/components/organisms/SectionCard";
import Button from "@atoms/Button";
import Input from "@atoms/Input";
import Loading from "@atoms/Loading";
import Select from "@atoms/Select";
import ConfirmDialog from "@molecules/ConfirmDialog";
import type {
  PixKeyLookup,
  PixKeyType,
  ReferralStats,
  ReferralWithdrawal,
  ReferralWithdrawalStatus,
} from "@/api/referrals/schema";
import {
  emitReferralBalanceChanged,
  fetchMyReferralStats,
  fetchMyReferralWithdrawals,
  lookupMyReferralWithdrawalPixKey,
  requestMyReferralWithdrawal,
  usePixWithdrawalForm,
} from "@/features/referrals";
import { settingsRoutePaths } from "@/router/navigation";
import { colors } from "@/config";
import { formatCurrencyFromCents, formatDateTimeDisplay } from "@/utils/format";
import { useToast } from "@/shared/toast/useToast";

const PIX_KEY_TYPE_LABELS: Record<PixKeyType, string> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  EMAIL: "E-mail",
  PHONE: "Telefone",
  EVP: "Chave aleatória",
};

const PIX_KEY_INPUT_PROPS: Record<
  PixKeyType,
  {
    placeholder: string;
    inputMode: "numeric" | "email" | "text";
    maxLength: number;
  }
> = {
  CPF: { placeholder: "000.000.000-00", inputMode: "numeric", maxLength: 14 },
  CNPJ: {
    placeholder: "00.000.000/0000-00",
    inputMode: "numeric",
    maxLength: 18,
  },
  EMAIL: {
    placeholder: "seuemail@exemplo.com",
    inputMode: "email",
    maxLength: 254,
  },
  PHONE: {
    placeholder: "(11) 91234-5678",
    inputMode: "numeric",
    maxLength: 15,
  },
  EVP: {
    placeholder: "123e4567-e89b-12d3-a456-426614174000",
    inputMode: "text",
    maxLength: 36,
  },
};

const WITHDRAWAL_STATUS_STYLES: Record<
  ReferralWithdrawalStatus,
  { label: string; color: string; background: string }
> = {
  REQUESTED: { label: "Solicitado", color: "#a16207", background: "#fef3c7" },
  PROCESSING: { label: "Processando", color: "#1d4ed8", background: "#dbeafe" },
  COMPLETED: { label: "Concluído", color: "#15803d", background: "#dcfce7" },
  FAILED: { label: "Falhou", color: "#b91c1c", background: "#fee2e2" },
};

export default function Referrals() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<ReferralWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const [isWithdrawFormOpen, setIsWithdrawFormOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pixKeyLookup, setPixKeyLookup] = useState<PixKeyLookup | null>(null);
  const [isLookingUpPixKey, setIsLookingUpPixKey] = useState(false);
  const [pixKeyLookupError, setPixKeyLookupError] = useState<string | null>(
    null,
  );

  const {
    form: withdrawalForm,
    errors: withdrawalErrors,
    submitting: isSubmittingWithdrawal,
    updatePixKeyType,
    updatePixKey,
    validate: validateWithdrawalForm,
    getSubmittableValues: getSubmittableWithdrawalValues,
    submit: submitWithdrawal,
    reset: resetWithdrawalForm,
  } = usePixWithdrawalForm({
    onSuccess: async ({ pixKey, pixKeyType }) => {
      try {
        await requestMyReferralWithdrawal({ pixKey, pixKeyType });
        showSuccess(
          "Saque solicitado",
          "Seu saque foi enviado via Pix e já deve cair na sua conta.",
        );
        setIsWithdrawFormOpen(false);
        resetWithdrawalForm();

        const [statsResult, withdrawalsResult] = await loadData();
        setStats(statsResult);
        setWithdrawals(withdrawalsResult);
        emitReferralBalanceChanged(statsResult.availableBalanceCents);
      } catch (error) {
        showError(
          "Não foi possível sacar",
          error instanceof Error
            ? error.message
            : "Tente novamente em instantes.",
        );
      }
    },
  });

  function loadData() {
    return Promise.all([fetchMyReferralStats(), fetchMyReferralWithdrawals()]);
  }

  useEffect(() => {
    let cancelled = false;

    loadData()
      .then(([statsResult, withdrawalsResult]) => {
        if (cancelled) return;
        setStats(statsResult);
        setWithdrawals(withdrawalsResult);
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

  function handleReviewWithdrawal() {
    if (!validateWithdrawalForm()) return;

    setIsConfirmModalOpen(true);
    void runPixKeyLookup();
  }

  async function runPixKeyLookup() {
    const values = getSubmittableWithdrawalValues();
    if (!values) return;

    setIsLookingUpPixKey(true);
    setPixKeyLookup(null);
    setPixKeyLookupError(null);

    try {
      const lookup = await lookupMyReferralWithdrawalPixKey(values);
      setPixKeyLookup(lookup);
    } catch (error) {
      setPixKeyLookupError(
        error instanceof Error
          ? error.message
          : "Não foi possível verificar essa chave Pix.",
      );
    } finally {
      setIsLookingUpPixKey(false);
    }
  }

  async function handleConfirmWithdrawal() {
    await submitWithdrawal();
    setIsConfirmModalOpen(false);
    setPixKeyLookup(null);
    setPixKeyLookupError(null);
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
  const canWithdraw = stats.availableBalanceCents >= stats.minWithdrawalCents;

  return (
    <div className="space-y-6">
      {backButton}

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

      <SectionCard
        title="Sua carteira"
        description="Saldo acumulado com suas indicações, disponível para saque via Pix."
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              className="rounded-lg border p-4"
              style={{ borderColor: colors.brown[100] }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: colors.brown[500] }}
              >
                Disponível para saque
              </p>
              <p
                className="mt-1 text-2xl font-bold"
                style={{ color: colors.brown[800] }}
              >
                {formatCurrencyFromCents(stats.availableBalanceCents)}
              </p>
            </div>
            <div
              className="rounded-lg border p-4"
              style={{ borderColor: colors.brown[100] }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: colors.brown[500] }}
              >
                Em confirmação
              </p>
              <p
                className="mt-1 text-2xl font-bold"
                style={{ color: colors.brown[500] }}
              >
                {formatCurrencyFromCents(stats.pendingHoldBalanceCents)}
              </p>
            </div>
          </div>

          <p className="text-xs" style={{ color: colors.brown[500] }}>
            Cada indicação fica em confirmação por {stats.creditHoldDays} dias
            após o amigo assinar o Pro antes de virar disponível para saque.
            Saque mínimo: {formatCurrencyFromCents(stats.minWithdrawalCents)}.
          </p>

          {!isWithdrawFormOpen ? (
            <Button
              type="button"
              variant="primary"
              leftIcon={<Banknote size={16} />}
              disabled={!canWithdraw}
              onClick={() => setIsWithdrawFormOpen(true)}
            >
              Sacar {formatCurrencyFromCents(stats.availableBalanceCents)}
            </Button>
          ) : (
            <div
              className="space-y-3 rounded-lg border p-4"
              style={{ borderColor: colors.brown[100], background: "#faf6f2" }}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Tipo de chave Pix"
                  value={withdrawalForm.pixKeyType}
                  onChange={(event) =>
                    updatePixKeyType(event.target.value as PixKeyType)
                  }
                >
                  {Object.entries(PIX_KEY_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Chave Pix"
                  value={withdrawalForm.pixKey}
                  onChange={(event) => updatePixKey(event.target.value)}
                  error={withdrawalErrors.pixKey}
                  placeholder={
                    PIX_KEY_INPUT_PROPS[withdrawalForm.pixKeyType].placeholder
                  }
                  inputMode={
                    PIX_KEY_INPUT_PROPS[withdrawalForm.pixKeyType].inputMode
                  }
                  maxLength={
                    PIX_KEY_INPUT_PROPS[withdrawalForm.pixKeyType].maxLength
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleReviewWithdrawal}
                >
                  Revisar e sacar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                  disabled={isSubmittingWithdrawal}
                  onClick={() => {
                    setIsWithdrawFormOpen(false);
                    resetWithdrawalForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {withdrawals.length > 0 && (
        <SectionCard
          title="Histórico de saques"
          description="Seus pedidos de saque de indicações."
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
                  <th className="py-2 pr-4">Valor</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Solicitado em</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => {
                  const statusStyle =
                    WITHDRAWAL_STATUS_STYLES[withdrawal.status];

                  return (
                    <tr
                      key={withdrawal.idReferralWithdrawal}
                      className="border-b last:border-0"
                      style={{ borderColor: colors.brown[100] }}
                    >
                      <td
                        className="py-2.5 pr-4 font-semibold"
                        style={{ color: colors.brown[800] }}
                      >
                        {formatCurrencyFromCents(withdrawal.amountCents)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{
                            color: statusStyle.color,
                            background: statusStyle.background,
                          }}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                      <td
                        className="py-2.5 pr-4"
                        style={{ color: colors.brown[500] }}
                      >
                        {formatDateTimeDisplay(withdrawal.requestedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      <ConfirmDialog
        open={isConfirmModalOpen}
        title="Confirmar saque via Pix"
        description={
          <div className="space-y-3">
            <p>
              Confira os dados abaixo com atenção. Depois de enviado, o saque é
              processado automaticamente e{" "}
              <strong>não pode ser cancelado ou desfeito</strong>.
            </p>
            <div
              className="space-y-2 rounded-lg border p-3 text-sm"
              style={{ borderColor: colors.brown[100] }}
            >
              <div className="flex items-center justify-between gap-3">
                <span style={{ color: colors.brown[500] }}>Valor</span>
                <span
                  className="font-semibold"
                  style={{ color: colors.brown[800] }}
                >
                  {formatCurrencyFromCents(stats.availableBalanceCents)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span style={{ color: colors.brown[500] }}>Tipo de chave</span>
                <span
                  className="font-semibold"
                  style={{ color: colors.brown[800] }}
                >
                  {PIX_KEY_TYPE_LABELS[withdrawalForm.pixKeyType]}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span style={{ color: colors.brown[500] }}>Chave Pix</span>
                <span
                  className="break-all text-right font-semibold"
                  style={{ color: colors.brown[800] }}
                >
                  {withdrawalForm.pixKey}
                </span>
              </div>
            </div>

            {isLookingUpPixKey && (
              <p className="text-xs" style={{ color: colors.brown[500] }}>
                Verificando o banco vinculado a esta chave...
              </p>
            )}

            {pixKeyLookup && (
              <div
                className="space-y-2 rounded-lg border p-3 text-sm"
                style={{
                  borderColor: colors.brown[100],
                  background: `${colors.purple[500]}0d`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: colors.purple[700] }}
                >
                  Confirmado junto ao Banco Central
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ color: colors.brown[500] }}>Banco</span>
                  <span
                    className="text-right font-semibold"
                    style={{ color: colors.brown[800] }}
                  >
                    {pixKeyLookup.bankName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ color: colors.brown[500] }}>Titular</span>
                  <span
                    className="text-right font-semibold"
                    style={{ color: colors.brown[800] }}
                  >
                    {pixKeyLookup.ownerName}
                    {pixKeyLookup.ownerDocument
                      ? ` (${pixKeyLookup.ownerDocument})`
                      : ""}
                  </span>
                </div>
              </div>
            )}

            {pixKeyLookupError && (
              <p className="text-xs" style={{ color: "#b45309" }}>
                Não foi possível confirmar o banco vinculado a esta chave.
                Confira os dados com atenção antes de continuar.
              </p>
            )}
          </div>
        }
        confirmLabel="Confirmar e sacar"
        cancelLabel="Revisar novamente"
        variant="warning"
        icon={<Banknote size={20} />}
        loading={isSubmittingWithdrawal || isLookingUpPixKey}
        onConfirm={() => {
          void handleConfirmWithdrawal();
        }}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setPixKeyLookup(null);
          setPixKeyLookupError(null);
        }}
      />
    </div>
  );
}
