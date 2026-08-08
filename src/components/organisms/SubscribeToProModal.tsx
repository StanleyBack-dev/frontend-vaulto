import { useState, type FormEvent } from "react";
import { Crown } from "lucide-react";
import type { SubscriptionBillingCycle } from "@/api/billing/schema";
import { PRO_PLAN_PRICES, requestSubscribeToPro } from "@/features/billing";
import Button from "@atoms/Button";
import Input from "@atoms/Input";
import Label from "@atoms/Label";
import { colors, radii, typography } from "../../config";
import { formatBrazilianDocument, onlyDigits } from "../../utils/format";

interface SubscribeToProModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribed: (checkoutUrl?: string) => void;
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

export default function SubscribeToProModal({
  open,
  onClose,
  onSubscribed,
}: SubscribeToProModalProps) {
  const [billingCycle, setBillingCycle] =
    useState<SubscriptionBillingCycle>("MONTHLY");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

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
      });
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#06050d]/70 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-2xl"
        style={{ borderColor: colors.brown[100], borderRadius: radii.lg }}
      >
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
              Você será levado ao checkout seguro da Asaas para escolher entre
              Cartão de Crédito, Pix ou Boleto.
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
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Continuar para pagamento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
