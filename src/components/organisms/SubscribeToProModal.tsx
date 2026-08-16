import { useState, type FormEvent } from "react";
import { Check, Copy, Crown } from "lucide-react";
import type { SubscriptionBillingCycle } from "@/api/billing/schema";
import { PRO_PLAN_PRICES, requestSubscribeToPro } from "@/features/billing";
import Button from "@atoms/Button";
import Input from "@atoms/Input";
import Label from "@atoms/Label";
import { colors, radii, typography } from "../../config";
import { formatBrazilianDocument, onlyDigits } from "../../utils/format";
import { useToast } from "../../shared/toast/useToast";

interface SubscribeToProModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribed: (checkoutUrl?: string) => void;
  onPixAuthorizationCreated: () => void;
}

interface PixQrCode {
  payload?: string;
  image?: string;
}

const CYCLE_OPTIONS: {
  value: SubscriptionBillingCycle;
  label: string;
  price: string;
  hint?: string;
}[] = [
  {
    value: "MONTHLY",
    label: "Mensal",
    price: `R$ ${PRO_PLAN_PRICES.MONTHLY.toFixed(2).replace(".", ",")}/mês`,
  },
  {
    value: "YEARLY",
    label: "Anual",
    price: `R$ ${PRO_PLAN_PRICES.YEARLY.toFixed(2).replace(".", ",")}/ano`,
    hint: "equivale a R$ 12,49/mês",
  },
];

// TEMP: Pix Automático hidden from checkout — the Asaas account isn't
// eligible yet (Pix Automático requires a PJ/CNPJ account approved by
// Asaas; ours is currently PF). Backend support is fully implemented and
// working (SubscribeToProCommand.pixAutomatic); once the account is
// eligible, uncomment this and the "Forma de pagamento" block below to
// bring the picker back.
// const BILLING_METHOD_OPTIONS: {
//   value: boolean;
//   label: string;
//   description: string;
// }[] = [
//   {
//     value: false,
//     label: "Cartão, Pix ou Boleto",
//     description: "Escolha a forma de pagamento no checkout seguro da Asaas.",
//   },
//   {
//     value: true,
//     label: "Pix Automático",
//     description:
//       "Cobrança recorrente via Pix, sem precisar pagar manualmente todo mês.",
//   },
// ];

export default function SubscribeToProModal({
  open,
  onClose,
  onSubscribed,
  onPixAuthorizationCreated,
}: SubscribeToProModalProps) {
  const { showSuccess, showError } = useToast();
  const [billingCycle, setBillingCycle] =
    useState<SubscriptionBillingCycle>("MONTHLY");
  // TEMP: hardcoded false while the Pix Automático picker is hidden — see
  // note above BILLING_METHOD_OPTIONS. Restore to
  // `useState(false)`/`setPixAutomatic` once the picker comes back.
  const pixAutomatic = false;
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixQrCode, setPixQrCode] = useState<PixQrCode | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  function resetAndClose() {
    setPixQrCode(null);
    setCopied(false);
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const digits = onlyDigits(cpfCnpj);
    if (digits.length !== 11 && digits.length !== 14) {
      setError("Informe um CPF ou CNPJ válido.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await requestSubscribeToPro({
        cpfCnpj: digits,
        billingCycle,
        pixAutomatic,
      });

      if (pixAutomatic && result.pixQrCodePayload) {
        setPixQrCode({
          payload: result.pixQrCodePayload,
          image: result.pixQrCodeImage ?? undefined,
        });
        return;
      }

      onSubscribed(result.checkoutUrl ?? undefined);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível iniciar a assinatura.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyPixCode() {
    if (!pixQrCode?.payload) return;

    try {
      await navigator.clipboard.writeText(pixQrCode.payload);
      setCopied(true);
      showSuccess("Código copiado", "Cole no Pix Copia e Cola do seu banco.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showError("Não foi possível copiar", "Copie o código manualmente.");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#06050d]/70 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : resetAndClose}
      />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-2xl"
        style={{ borderColor: colors.brown[100], borderRadius: radii.lg }}
      >
        {pixQrCode ? (
          <div className="p-6">
            <div className="flex items-start gap-4 pb-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `${colors.gold[500]}1f`,
                  color: colors.gold[600],
                }}
              >
                <Crown size={20} />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <h2
                  className="text-base font-bold"
                  style={{
                    color: colors.brown[800],
                    fontFamily: typography.fontFamily,
                  }}
                >
                  Escaneie ou copie o código Pix
                </h2>
                <p
                  className="mt-1 text-sm leading-relaxed"
                  style={{
                    color: colors.brown[500],
                    fontFamily: typography.fontFamily,
                  }}
                >
                  Assim que o pagamento for confirmado, seu Pro é ativado e as
                  próximas cobranças acontecem sozinhas.
                </p>
              </div>
            </div>

            {pixQrCode.image && (
              <div className="flex justify-center py-2">
                <img
                  src={pixQrCode.image}
                  alt="QR Code Pix"
                  className="h-48 w-48 rounded-lg border"
                  style={{ borderColor: colors.brown[100] }}
                />
              </div>
            )}

            {pixQrCode.payload && (
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full !border-gray-400 !text-gray-700 hover:!bg-gray-100"
                leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={handleCopyPixCode}
              >
                {copied ? "Código copiado" : "Copiar código Pix"}
              </Button>
            )}

            <div
              className="mt-5 flex justify-end border-t pt-4"
              style={{ borderColor: colors.brown[100] }}
            >
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  resetAndClose();
                  onPixAuthorizationCreated();
                }}
              >
                Concluir
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4 p-6 pb-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `${colors.gold[500]}1f`,
                  color: colors.gold[600],
                }}
              >
                <Crown size={20} />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <h2
                  className="text-base font-bold"
                  style={{
                    color: colors.brown[800],
                    fontFamily: typography.fontFamily,
                  }}
                >
                  Assinar Vaulto Pro
                </h2>
                <p
                  className="mt-1 text-sm leading-relaxed"
                  style={{
                    color: colors.brown[500],
                    fontFamily: typography.fontFamily,
                  }}
                >
                  {pixAutomatic
                    ? "Você vai gerar um Pix único que autoriza as cobranças futuras automaticamente."
                    : "Você será levado ao checkout seguro da Asaas para escolher entre Cartão de Crédito, Pix ou Boleto."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-6 pb-2">
                <div>
                  <Label>Ciclo de cobrança</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {CYCLE_OPTIONS.map((option) => {
                      const isSelected = billingCycle === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setBillingCycle(option.value)}
                          className="rounded-xl border px-3 py-2.5 text-left transition-colors"
                          style={{
                            borderColor: isSelected
                              ? colors.gold[500]
                              : colors.brown[100],
                            background: isSelected
                              ? `${colors.gold[500]}14`
                              : "#fff",
                          }}
                        >
                          <span
                            className="block text-sm font-semibold"
                            style={{ color: colors.brown[800] }}
                          >
                            {option.label}
                          </span>
                          <span
                            className="block text-xs"
                            style={{ color: colors.brown[500] }}
                          >
                            {option.price}
                          </span>
                          {option.hint && (
                            <span
                              className="mt-0.5 block text-[11px] font-semibold"
                              style={{ color: colors.gold[600] }}
                            >
                              {option.hint}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TEMP: Pix Automático payment-method picker hidden — see
                    note above BILLING_METHOD_OPTIONS.
                <div>
                  <Label>Forma de pagamento</Label>
                  <div className="mt-2 space-y-2">
                    {BILLING_METHOD_OPTIONS.map((option) => {
                      const isSelected = pixAutomatic === option.value;
                      return (
                        <button
                          key={String(option.value)}
                          type="button"
                          onClick={() => setPixAutomatic(option.value)}
                          className="block w-full rounded-xl border px-3 py-2.5 text-left transition-colors"
                          style={{
                            borderColor: isSelected
                              ? colors.gold[500]
                              : colors.brown[100],
                            background: isSelected
                              ? `${colors.gold[500]}14`
                              : "#fff",
                          }}
                        >
                          <span
                            className="block text-sm font-semibold"
                            style={{ color: colors.brown[800] }}
                          >
                            {option.label}
                          </span>
                          <span
                            className="block text-xs"
                            style={{ color: colors.brown[500] }}
                          >
                            {option.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                */}

                <Input
                  label="CPF ou CNPJ"
                  required
                  value={cpfCnpj}
                  onChange={(event) =>
                    setCpfCnpj(formatBrazilianDocument(event.target.value))
                  }
                  placeholder="000.000.000-00"
                  error={error ?? undefined}
                />
              </div>

              <div
                className="flex justify-end gap-3 border-t px-6 py-4"
                style={{ borderColor: colors.brown[100] }}
              >
                <Button
                  type="button"
                  variant="outline"
                  className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                  onClick={resetAndClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={isSubmitting}>
                  Continuar para pagamento
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
