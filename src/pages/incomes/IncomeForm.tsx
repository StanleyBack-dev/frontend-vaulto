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
import { formatCurrencyForInput, maskCurrencyInput } from "@/utils/format";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface IncomeFormErrors {
  title?: string;
  category?: string;
  expectedAmount?: string;
  expectedDate?: string;
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
          expectedAmount: formatCurrencyForInput(income.expectedAmount),
          expectedDate: income.expectedDate.slice(0, 10),
          isRecurring: income.isRecurring,
          receivedAmount: formatCurrencyForInput(income.receivedAmount),
          receivedAt: income.receivedAt?.slice(0, 10) || "",
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

  function validate(values: IncomeFormValues): IncomeFormErrors {
    const nextErrors: IncomeFormErrors = {};

    if (!values.title.trim()) {
      nextErrors.title = "Informe o título da receita.";
    }

    if (!values.idCategory) {
      nextErrors.category = "Selecione a categoria da receita.";
    }

    if (parseNumber(values.expectedAmount) <= 0) {
      nextErrors.expectedAmount = "Informe um valor esperado válido.";
    }

    if (!values.expectedDate) {
      nextErrors.expectedDate = "Informe a data esperada do recebimento.";
    }

    if (mode === "edit" && !values.status) {
      nextErrors.status = "Selecione um status.";
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
      const created = await create({
        title: form.title.trim(),
        idCategory: form.idCategory,
        description: form.description.trim() || undefined,
        incomeType: form.incomeType,
        expectedAmount: parseNumber(form.expectedAmount),
        expectedDate: form.expectedDate,
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
      expectedAmount: parseNumber(form.expectedAmount),
      expectedDate: form.expectedDate,
      receivedAmount: parseNumber(form.receivedAmount),
      receivedAt: form.receivedAt || undefined,
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
        description="Fluxo de receitas para cadastro e controle de recebimentos."
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
              error={errors.status}
            >
              {incomeStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
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
        description="Valor esperado e, se já houver recebimento, quanto já foi recebido."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Valor esperado"
            inputMode="decimal"
            value={form.expectedAmount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                expectedAmount: maskCurrencyInput(event.target.value),
              }))
            }
            placeholder="0,00"
            required
            error={errors.expectedAmount}
          />

          {mode === "edit" && (
            <Input
              label="Valor recebido"
              inputMode="decimal"
              value={form.receivedAmount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  receivedAmount: maskCurrencyInput(event.target.value),
                }))
              }
              placeholder="0,00"
            />
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Datas"
        description="Quando a receita é esperada e, se já recebida, quando isso ocorreu."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Data esperada"
            type="date"
            value={form.expectedDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                expectedDate: event.target.value,
              }))
            }
            required
            error={errors.expectedDate}
          />

          {mode === "edit" && (
            <Input
              label="Data de recebimento (opcional)"
              type="date"
              value={form.receivedAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  receivedAt: event.target.value,
                }))
              }
            />
          )}
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
