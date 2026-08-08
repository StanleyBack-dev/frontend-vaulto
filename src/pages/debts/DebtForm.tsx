import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import SectionCard from "@/components/organisms/SectionCard";
import UpgradeModal from "@/components/organisms/UpgradeModal";
import { colors } from "@/config";
import {
  debtStatusOptions,
  debtTypeOptions,
  emptyDebtFormValues,
  fetchDebtById,
  type DebtFormValues,
  useDebtsContext,
} from "@/features/debts";
import type { DebtStatus } from "@/api/debts/schema";
import { creditCardRoutePaths, debtRoutePaths } from "@/router";
import { useToast } from "@/shared/toast/useToast";
import {
  formatCurrencyForInput,
  maskCurrencyInput,
  onlyDigits,
} from "@/utils/format";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface DebtFormErrors {
  title?: string;
  category?: string;
  totalAmount?: string;
  dueDate?: string;
  acquiredAt?: string;
  installmentCount?: string;
  installmentAmount?: string;
  status?: string;
}

function parseNumber(value: string): number {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function todayDateInputValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function DebtForm({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showError } = useToast();
  const {
    create,
    updateStatus,
    updateDetails,
    saving,
    debtCategories,
    debtCreditCards,
    planLimitMessage,
    dismissPlanLimitMessage,
  } = useDebtsContext();

  const [form, setForm] = useState<DebtFormValues>(emptyDebtFormValues);
  const [errors, setErrors] = useState<DebtFormErrors>({});
  const [loadingDebt, setLoadingDebt] = useState(mode === "edit");
  const [originalStatus, setOriginalStatus] = useState<DebtStatus | null>(null);
  const [linkedCreditCard, setLinkedCreditCard] = useState<string | null>(null);

  const availableCategories = useMemo(() => debtCategories, [debtCategories]);

  const selectedCreditCard = useMemo(
    () =>
      debtCreditCards.find((card) => card.idCreditCard === form.idCreditCard),
    [debtCreditCards, form.idCreditCard],
  );

  useEffect(() => {
    if (mode !== "edit" || !id) {
      return;
    }

    let isMounted = true;

    void (async () => {
      setLoadingDebt(true);
      try {
        const debt = await fetchDebtById(id);

        if (!isMounted) return;

        setForm({
          title: debt.title,
          idCategory: debt.idCategory,
          idCreditCard: debt.idCreditCard || "",
          description: debt.description || "",
          debtType: debt.debtType,
          totalAmount: formatCurrencyForInput(debt.totalAmount),
          dueDate: debt.dueDate?.slice(0, 10) || "",
          acquiredAt: debt.acquiredAt?.slice(0, 10) || "",
          hasInstallments: debt.hasInstallments,
          installmentCount: String(debt.installmentCount || ""),
          installmentAmount:
            debt.hasInstallments && debt.installmentCount
              ? formatCurrencyForInput(debt.totalAmount / debt.installmentCount)
              : "",
          installmentEntryMode: "TOTAL",
          status: debt.status,
        });
        setOriginalStatus(debt.status);
        setLinkedCreditCard(debt.creditCard || null);
      } catch (error) {
        if (!isMounted) return;

        const message = toErrorMessage(
          error,
          "Não foi possível carregar a dívida.",
        );
        showError("Falha ao carregar dívida", message);
        navigate(debtRoutePaths.management, { replace: true });
      } finally {
        if (isMounted) {
          setLoadingDebt(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id, mode, navigate, showError]);

  const title = useMemo(() => {
    return mode === "create" ? "Cadastro de dívida" : "Editar dívida";
  }, [mode]);

  const calculatedTotalAmount = useMemo(() => {
    if (!form.hasInstallments || form.installmentEntryMode !== "INSTALLMENT") {
      return parseNumber(form.totalAmount);
    }

    const installments = Number(form.installmentCount || 0);
    const installmentAmount = parseNumber(form.installmentAmount);
    return Number((installments * installmentAmount).toFixed(2));
  }, [
    form.hasInstallments,
    form.installmentAmount,
    form.installmentCount,
    form.installmentEntryMode,
    form.totalAmount,
  ]);

  const calculatedInstallmentAmount = useMemo(() => {
    if (!form.hasInstallments || form.installmentEntryMode !== "TOTAL") {
      return parseNumber(form.installmentAmount);
    }

    const installments = Number(form.installmentCount || 0);
    if (!installments) return 0;
    return Number((parseNumber(form.totalAmount) / installments).toFixed(2));
  }, [
    form.hasInstallments,
    form.installmentAmount,
    form.installmentCount,
    form.installmentEntryMode,
    form.totalAmount,
  ]);

  function validate(values: DebtFormValues): DebtFormErrors {
    const nextErrors: DebtFormErrors = {};

    if (!values.title.trim()) {
      nextErrors.title = "Informe o título da dívida.";
    }

    if (!values.idCategory) {
      nextErrors.category = "Selecione a categoria da dívida.";
    }

    if (mode === "create") {
      const totalAmount =
        values.hasInstallments && values.installmentEntryMode === "INSTALLMENT"
          ? parseNumber(values.installmentAmount) *
            Number(values.installmentCount || 0)
          : parseNumber(values.totalAmount);

      if (totalAmount <= 0) {
        nextErrors.totalAmount = "Informe um valor total válido.";
      }

      if (values.idCreditCard && !values.acquiredAt) {
        nextErrors.acquiredAt =
          "Informe a data da compra para calcular o vencimento no cartão.";
      }

      if (values.hasInstallments) {
        if (!values.dueDate && !values.idCreditCard) {
          nextErrors.dueDate = "Informe a data de vencimento da 1a parcela.";
        }

        const installments = Number(values.installmentCount);
        if (!Number.isInteger(installments) || installments < 2) {
          nextErrors.installmentCount = "Informe pelo menos 2 parcelas.";
        }

        if (
          values.installmentEntryMode === "INSTALLMENT" &&
          parseNumber(values.installmentAmount) <= 0
        ) {
          nextErrors.installmentAmount = "Informe um valor de parcela válido.";
        }
      }
    }

    if (mode === "edit" && !values.status) {
      nextErrors.status = "Selecione um status.";
    }

    if (mode === "edit" && !values.hasInstallments) {
      if (parseNumber(values.totalAmount) <= 0) {
        nextErrors.totalAmount = "Informe um valor total válido.";
      }
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validation = validate(form);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    if (mode === "create") {
      const installmentCount = form.hasInstallments
        ? Number(form.installmentCount)
        : undefined;
      const installmentAmount =
        form.hasInstallments && form.installmentEntryMode === "INSTALLMENT"
          ? parseNumber(form.installmentAmount)
          : undefined;
      const totalAmount =
        form.hasInstallments && form.installmentEntryMode === "INSTALLMENT"
          ? Number(
              ((installmentAmount ?? 0) * (installmentCount ?? 0)).toFixed(2),
            )
          : parseNumber(form.totalAmount);

      const created = await create({
        title: form.title.trim(),
        idCategory: form.idCategory,
        idCreditCard: form.idCreditCard || undefined,
        description: form.description.trim() || undefined,
        debtType: form.debtType,
        totalAmount,
        dueDate: form.idCreditCard ? undefined : form.dueDate || undefined,
        acquiredAt:
          (form.hasInstallments || form.idCreditCard) && form.acquiredAt
            ? form.acquiredAt
            : undefined,
        hasInstallments: form.hasInstallments,
        installmentCount,
        installmentAmount,
      });

      if (created) {
        navigate(debtRoutePaths.management);
      }

      return;
    }

    if (!id) {
      showError("Identificador inválido", "A dívida selecionada é inválida.");
      return;
    }

    const detailsUpdated = await updateDetails({
      idDebt: id,
      title: form.title.trim(),
      description: form.description.trim(),
      idCategory: form.idCategory,
      debtType: form.debtType,
      acquiredAt:
        form.hasInstallments && form.acquiredAt ? form.acquiredAt : undefined,
      dueDate: !form.hasInstallments && form.dueDate ? form.dueDate : undefined,
      totalAmount: !form.hasInstallments
        ? parseNumber(form.totalAmount)
        : undefined,
    });

    if (!detailsUpdated) {
      return;
    }

    if (form.status === originalStatus) {
      navigate(debtRoutePaths.management);
      return;
    }

    const updated = await updateStatus({
      idDebt: id,
      status: form.status,
    });

    if (updated) {
      navigate(debtRoutePaths.management);
    }
  }

  if (loadingDebt) {
    return (
      <div className="flex h-56 items-center justify-center">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2"
          style={{
            borderColor: colors.gold[500],
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionCard
        title={title}
        description="Fluxo de dívidas para cadastro e controle de status."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Título"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Ex: Fatura operação julho"
            required
            error={errors.title}
          />

          <Select
            label="Categoria"
            value={form.idCategory}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                idCategory: event.target.value,
              }))
            }
            required
            error={errors.category}
          >
            <option value="">Selecione</option>
            {availableCategories.map((category) => (
              <option key={category.idCategory} value={category.idCategory}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select
            label="Tipo da dívida"
            value={form.debtType}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                debtType: event.target.value as DebtFormValues["debtType"],
              }))
            }
            required
          >
            {debtTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>

          {mode === "edit" && (
            <div>
              <Select
                label="Status"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as DebtFormValues["status"],
                  }))
                }
                required
                disabled={
                  originalStatus === "PAID" ||
                  originalStatus === "PARTIALLY_PAID"
                }
                error={errors.status}
              >
                {debtStatusOptions
                  .filter(
                    (status) =>
                      status.value === "OPEN" ||
                      status.value === "OVERDUE" ||
                      status.value === form.status,
                  )
                  .map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
              </Select>
              {(originalStatus === "PAID" ||
                originalStatus === "PARTIALLY_PAID") && (
                <p
                  className="mt-1 text-xs"
                  style={{ color: colors.brown[500] }}
                >
                  Este status é atualizado automaticamente pelos pagamentos
                  registrados.
                </p>
              )}
            </div>
          )}

          <div className="md:col-span-2">
            <Textarea
              label="Descrição"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Contexto da dívida e observações operacionais"
              rows={4}
            />
          </div>
        </div>
      </SectionCard>

      {mode === "create" && (
        <SectionCard
          title="Cartão de crédito"
          description="Vincule a dívida a um cartão para calcular o vencimento automaticamente pela fatura, ou deixe em branco para uma dívida sem cartão."
          action={
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => navigate(creditCardRoutePaths.create)}
            >
              Novo cartão
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Select
                label="Cartão de crédito (opcional)"
                value={form.idCreditCard}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    idCreditCard: event.target.value,
                    dueDate: event.target.value ? "" : current.dueDate,
                    acquiredAt:
                      event.target.value && !current.acquiredAt
                        ? todayDateInputValue()
                        : current.acquiredAt,
                  }))
                }
              >
                <option value="">Nenhum</option>
                {debtCreditCards.map((card) => (
                  <option key={card.idCreditCard} value={card.idCreditCard}>
                    {card.name}
                  </option>
                ))}
              </Select>
              {debtCreditCards.length === 0 && (
                <p
                  className="mt-1 text-xs"
                  style={{ color: colors.brown[500] }}
                >
                  Nenhum cartão cadastrado ainda. Use o botão "Novo cartão"
                  acima para cadastrar um.
                </p>
              )}
              {selectedCreditCard && (
                <p
                  className="mt-1 text-xs"
                  style={{ color: colors.brown[500] }}
                >
                  Limite disponível:{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(selectedCreditCard.availableLimit)}
                  . A data de vencimento será calculada automaticamente pelo
                  cartão (dia {selectedCreditCard.dueDay}).
                </p>
              )}
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="Valores"
        description="Valor total da dívida e, se for parcelada, como as parcelas são calculadas."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Valor total"
            inputMode="decimal"
            value={
              form.hasInstallments &&
              form.installmentEntryMode === "INSTALLMENT"
                ? formatCurrencyForInput(calculatedTotalAmount)
                : form.totalAmount
            }
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                totalAmount: maskCurrencyInput(event.target.value),
              }))
            }
            placeholder="0,00"
            disabled={
              (mode === "edit" && form.hasInstallments) ||
              (mode === "create" &&
                form.hasInstallments &&
                form.installmentEntryMode === "INSTALLMENT")
            }
            required={
              (mode === "create" &&
                !(
                  form.hasInstallments &&
                  form.installmentEntryMode === "INSTALLMENT"
                )) ||
              (mode === "edit" && !form.hasInstallments)
            }
            error={errors.totalAmount}
          />

          <div className="flex items-center md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-[#4a3f6b]">
              <input
                type="checkbox"
                checked={form.hasInstallments}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    hasInstallments: event.target.checked,
                    installmentCount: event.target.checked
                      ? current.installmentCount
                      : "",
                  }))
                }
                disabled={mode === "edit"}
              />
              Possui parcelamento
            </label>
          </div>

          {form.hasInstallments && (
            <>
              <Input
                label="Quantidade de parcelas"
                inputMode="numeric"
                value={form.installmentCount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    installmentCount: onlyDigits(event.target.value, 3),
                  }))
                }
                disabled={mode === "edit"}
                required={mode === "create"}
                error={errors.installmentCount}
              />

              <Select
                label="Forma de preenchimento"
                value={form.installmentEntryMode}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    installmentEntryMode: event.target
                      .value as DebtFormValues["installmentEntryMode"],
                  }))
                }
                disabled={mode === "edit"}
              >
                <option value="TOTAL">Informar valor total</option>
                <option value="INSTALLMENT">Informar valor da parcela</option>
              </Select>

              {form.installmentEntryMode === "INSTALLMENT" ? (
                <Input
                  label="Valor da parcela"
                  inputMode="decimal"
                  value={form.installmentAmount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      installmentAmount: maskCurrencyInput(event.target.value),
                    }))
                  }
                  disabled={mode === "edit"}
                  required={mode === "create"}
                  error={errors.installmentAmount}
                />
              ) : (
                <Input
                  label="Valor da parcela (calculado)"
                  value={formatCurrencyForInput(calculatedInstallmentAmount)}
                  disabled
                />
              )}
            </>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Datas e vencimento"
        description="Quando a dívida vence e, se necessário, quando ela foi contraída ou comprada."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Input
              label={
                form.hasInstallments
                  ? "Data de vencimento (1a parcela)"
                  : "Data de vencimento (opcional)"
              }
              type="date"
              value={form.dueDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
              disabled={
                (mode === "edit" &&
                  (form.hasInstallments || Boolean(linkedCreditCard))) ||
                (mode === "create" && Boolean(form.idCreditCard))
              }
              required={
                mode === "create" && form.hasInstallments && !form.idCreditCard
              }
              error={errors.dueDate}
            />
            {mode === "edit" && linkedCreditCard && (
              <p className="mt-1 text-xs" style={{ color: colors.brown[500] }}>
                Vencimento calculado automaticamente pelo cartão{" "}
                {linkedCreditCard}.
              </p>
            )}
          </div>

          {(form.hasInstallments ||
            (mode === "create" && Boolean(form.idCreditCard))) && (
            <div>
              <Input
                label={
                  mode === "create" && form.idCreditCard
                    ? "Data da compra"
                    : "Data de início (opcional)"
                }
                type="date"
                value={form.acquiredAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    acquiredAt: event.target.value,
                  }))
                }
                required={mode === "create" && Boolean(form.idCreditCard)}
                error={errors.acquiredAt}
              />
              {mode === "create" && form.idCreditCard && (
                <p
                  className="mt-1 text-xs"
                  style={{ color: colors.brown[500] }}
                >
                  Usada para calcular em qual fatura a compra cai — importante
                  para dívidas antigas que não foram compradas hoje.
                </p>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
          onClick={() => navigate(debtRoutePaths.management)}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          {mode === "create" ? "Cadastrar dívida" : "Salvar alterações"}
        </Button>
      </div>

      <UpgradeModal
        open={Boolean(planLimitMessage)}
        message={planLimitMessage ?? ""}
        onClose={dismissPlanLimitMessage}
      />
    </form>
  );
}
