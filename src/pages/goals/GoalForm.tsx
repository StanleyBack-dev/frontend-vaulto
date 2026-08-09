import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import SectionCard from "@/components/organisms/SectionCard";
import { colors } from "@/config";
import {
  emptyGoalFormValues,
  fetchGoalById,
  goalStatusLabel,
  type GoalFormValues,
  useGoalsContext,
} from "@/features/goals";
import type { FinancialGoalStatus } from "@/api/goals/schema";
import { goalRoutePaths } from "@/router";
import { useToast } from "@/shared/toast/useToast";
import { formatCurrencyForInput, maskCurrencyInput } from "@/utils/format";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface GoalFormErrors {
  title?: string;
  targetAmount?: string;
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

export default function GoalForm({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showError } = useToast();
  const { create, updateDetails, saving } = useGoalsContext();

  const [form, setForm] = useState<GoalFormValues>(emptyGoalFormValues);
  const [errors, setErrors] = useState<GoalFormErrors>({});
  const [loadingGoal, setLoadingGoal] = useState(mode === "edit");
  const [goalStatus, setGoalStatus] = useState<FinancialGoalStatus | null>(
    null,
  );

  useEffect(() => {
    if (mode !== "edit" || !id) {
      return;
    }

    let isMounted = true;

    void (async () => {
      setLoadingGoal(true);
      try {
        const loadedGoal = await fetchGoalById(id);

        if (!isMounted) return;

        setForm({
          title: loadedGoal.title,
          description: loadedGoal.description || "",
          targetAmount: formatCurrencyForInput(loadedGoal.targetAmount),
          targetDate: loadedGoal.targetDate?.slice(0, 10) || "",
        });
        setGoalStatus(loadedGoal.status);
      } catch (error) {
        if (!isMounted) return;

        const message = toErrorMessage(
          error,
          "Não foi possível carregar a meta.",
        );
        showError("Falha ao carregar meta", message);
        navigate(goalRoutePaths.list, { replace: true });
      } finally {
        if (isMounted) {
          setLoadingGoal(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id, mode, navigate, showError]);

  const title = useMemo(() => {
    return mode === "create" ? "Cadastro de meta" : "Editar meta";
  }, [mode]);

  function validate(values: GoalFormValues): GoalFormErrors {
    const nextErrors: GoalFormErrors = {};

    if (!values.title.trim()) {
      nextErrors.title = "Informe o título da meta.";
    }

    if (parseNumber(values.targetAmount) <= 0) {
      nextErrors.targetAmount = "Informe um valor alvo válido.";
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
        description: form.description.trim() || undefined,
        targetAmount: parseNumber(form.targetAmount),
        targetDate: form.targetDate || undefined,
      });

      if (created) {
        navigate(goalRoutePaths.list);
      }

      return;
    }

    if (!id) {
      showError("Identificador inválido", "A meta selecionada é inválida.");
      return;
    }

    const updated = await updateDetails({
      idFinancialGoal: id,
      title: form.title.trim(),
      description: form.description.trim(),
      targetAmount: parseNumber(form.targetAmount),
      targetDate: form.targetDate || undefined,
    });

    if (updated) {
      navigate(goalRoutePaths.list);
    }
  }

  if (loadingGoal) {
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
        description="Defina o objetivo e o valor que você quer alcançar."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Título"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder="Ex: Reserva de emergência"
            required
            error={errors.title}
          />

          <Input
            label="Valor alvo"
            inputMode="decimal"
            value={form.targetAmount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                targetAmount: maskCurrencyInput(event.target.value),
              }))
            }
            placeholder="0,00"
            required
            error={errors.targetAmount}
          />

          <Input
            label="Data alvo (opcional)"
            type="date"
            value={form.targetDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                targetDate: event.target.value,
              }))
            }
          />

          {mode === "edit" && goalStatus && (
            <Input
              label="Status"
              value={goalStatusLabel(goalStatus)}
              disabled
            />
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
              placeholder="Contexto e observações sobre a meta"
              rows={4}
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
          onClick={() => navigate(goalRoutePaths.list)}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          {mode === "create" ? "Cadastrar meta" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
