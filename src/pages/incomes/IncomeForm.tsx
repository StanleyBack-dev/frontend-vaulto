import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import SectionCard from "@/components/organisms/SectionCard";
import { colors } from "@/config";
import {
  emptyIncomeFormValues,
  fetchIncomeById,
  incomeStatusOptions,
  incomeTypeOptions,
  type IncomeFormValues,
  useIncomesContext,
} from "@/features/incomes";
import type { IncomeStatus } from "@/api/incomes/schema";
import { incomeRoutePaths } from "@/router";
import { useToast } from "@/shared/toast/useToast";
import {
  formatCurrencyForInput,
  maskCurrencyInput,
  onlyDigits,
} from "@/utils/format";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface IncomeFormErrors {
  title?: string;
  category?: string;
  totalAmount?: string;
  dueDate?: string;
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

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function IncomeForm({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showError } = useToast();
  const { create, updateStatus, updateDetails, saving, incomeCategories } =
    useIncomesContext();

  const [form, setForm] = useState<IncomeFormValues>(emptyIncomeFormValues);
  const [errors, setErrors] = useState<IncomeFormErrors>({});
  const [loadingIncome, setLoadingIncome] = useState(mode === "edit");
  const [originalStatus, setOriginalStatus] = useState<IncomeStatus | null>(
    null,
  );

  useEffect(() => {
    if (mode !== "edit" || !id) {
      return;
    }

    let isMounted = true;

    void (async () => {
      setLoadingIncome(true);
      try {
        const income = await fetchIncomeById(id);

        if (!isMounted) return;

        setForm({
          title: income.title,
          idCategory: income.idCategory,
          description: income.description || "",
          incomeType: income.incomeType,
          totalAmount: formatCurrencyForInput(income.totalAmount),
          dueDate: income.dueDate?.slice(0, 10) || "",
          hasInstallments: income.hasInstallments,
          installmentCount: String(income.installmentCount || ""),
          installmentAmount:
            income.hasInstallments && income.installmentCount
              ? formatCurrencyForInput(
                  income.totalAmount / income.installmentCount,
                )
              : "",
          installmentEntryMode: "TOTAL",
          isRecurring: income.isRecurring,
          status: income.status,
        });
        setOriginalStatus(income.status);
      } catch (error) {
        if (!isMounted) return;

        const message = toErrorMessage(
          error,
          "Não foi possível carregar a receita.",
        );
        showError("Falha ao carregar receita", message);
        navigate(incomeRoutePaths.list, { replace: true });
      } finally {
        if (isMounted) {
          setLoadingIncome(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id, mode, navigate, showError]);

  const title = useMemo(() => {
    return mode === "create" ? "Cadastro de receita" : "Editar receita";
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

  function validate(values: IncomeFormValues): IncomeFormErrors {
    const nextErrors: IncomeFormErrors = {};

    if (!values.title.trim()) {
      nextErrors.title = "Informe o título da receita.";
    }

    if (!values.idCategory) {
      nextErrors.category = "Selecione a categoria da receita.";
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

      if (values.hasInstallments) {
        if (!values.dueDate) {
          nextErrors.dueDate = "Informe a data de vencimento da 1ª parcela.";
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
        description: form.description.trim() || undefined,
        incomeType: form.incomeType,
        totalAmount,
        dueDate: form.dueDate || undefined,
        hasInstallments: form.hasInstallments,
        installmentCount,
        installmentAmount,
        isRecurring: form.isRecurring,
      });

      if (created) {
        navigate(incomeRoutePaths.list);
      }

      return;
    }

    if (!id) {
      showError("Identificador inválido", "A receita selecionada é inválida.");
      return;
    }

    const detailsUpdated = await updateDetails({
      idIncome: id,
      title: form.title.trim(),
      description: form.description.trim(),
      idCategory: form.idCategory,
      incomeType: form.incomeType,
      dueDate: !form.hasInstallments && form.dueDate ? form.dueDate : undefined,
      totalAmount: !form.hasInstallments
        ? parseNumber(form.totalAmount)
        : undefined,
      isRecurring: form.isRecurring,
    });

    if (!detailsUpdated) {
      return;
    }

    if (form.status === originalStatus) {
      navigate(incomeRoutePaths.list);
      return;
    }

    const updated = await updateStatus({
      idIncome: id,
      status: form.status,
    });

    if (updated) {
      navigate(incomeRoutePaths.list);
    }
  }

  if (loadingIncome) {
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
        description="Fluxo de receitas para cadastro e controle de status."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Título"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Ex: Salário de agosto"
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
            {incomeCategories.map((category) => (
              <option key={category.idCategory} value={category.idCategory}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select
            label="Tipo da receita"
            value={form.incomeType}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                incomeType: event.target
                  .value as IncomeFormValues["incomeType"],
              }))
            }
            required
          >
            {incomeTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>

          {mode === "edit" && (
            <Select
              label="Status"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as IncomeFormValues["status"],
                }))
              }
              required
              disabled={
                originalStatus === "RECEIVED" ||
                originalStatus === "PARTIALLY_RECEIVED"
              }
              error={errors.status}
            >
              {incomeStatusOptions
                .filter(
                  (status) =>
                    status.value === "PENDING" ||
                    status.value === "OVERDUE" ||
                    status.value === form.status,
                )
                .map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
            </Select>
          )}
          {mode === "edit" &&
            (originalStatus === "RECEIVED" ||
              originalStatus === "PARTIALLY_RECEIVED") && (
              <p
                className="mt-1 text-xs md:col-span-2"
                style={{ color: colors.brown[500] }}
              >
                Este status é atualizado automaticamente pelos recebimentos
                registrados.
              </p>
            )}

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-[#4a3f6b]">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isRecurring: event.target.checked,
                  }))
                }
              />
              É uma receita recorrente (ex: salário mensal)
            </label>
          </div>

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
              placeholder="Contexto da receita e observações"
              rows={4}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Valores"
        description="Valor total da receita e, se for parcelada (ex: valor a receber de um devedor), como as parcelas são calculadas."
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
              Possui parcelamento (ex: valor a receber dividido em parcelas)
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
                      .value as IncomeFormValues["installmentEntryMode"],
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
        description="Quando a receita é esperada, ou quando vence a 1ª parcela, se parcelada."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label={
              form.hasInstallments
                ? "Data de vencimento (1ª parcela)"
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
            disabled={mode === "edit" && form.hasInstallments}
            required={mode === "create" && form.hasInstallments}
            error={errors.dueDate}
          />
        </div>
      </SectionCard>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
          onClick={() => navigate(incomeRoutePaths.list)}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          {mode === "create" ? "Cadastrar receita" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
