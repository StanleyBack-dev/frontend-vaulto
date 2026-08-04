import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import SectionCard from "@/components/organisms/SectionCard";
import { colors } from "@/config";
import {
  creditCardUiCopy,
  emptyCreditCardFormValues,
  fetchCreditCardById,
  mapCreditCardToFormValues,
  parseCurrencyValue,
  type CreditCardFormValues,
  useCreditCardsContext,
} from "@/features/credit-cards";
import { creditCardRoutePaths } from "@/router";
import { useToast } from "@/shared/toast/useToast";
import { maskCurrencyInput } from "@/utils/format";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => index + 1);

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function CreditCardForm({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showError } = useToast();
  const { save, saving } = useCreditCardsContext();
  const [values, setValues] = useState<CreditCardFormValues>(
    emptyCreditCardFormValues,
  );
  const [errors, setErrors] = useState<{
    name?: string;
    creditLimit?: string;
    dueDay?: string;
    closingDay?: string;
  }>({});
  const [loadingCreditCard, setLoadingCreditCard] = useState(mode === "edit");

  useEffect(() => {
    if (mode !== "edit" || !id) {
      return;
    }

    let isMounted = true;

    void (async () => {
      setLoadingCreditCard(true);
      try {
        const creditCard = await fetchCreditCardById(id);
        if (!isMounted) return;
        setValues(mapCreditCardToFormValues(creditCard));
      } catch (error) {
        if (!isMounted) return;
        const message = toErrorMessage(
          error,
          "Não foi possível carregar o cartão de crédito.",
        );
        showError("Falha ao carregar cartão de crédito", message);
        navigate(creditCardRoutePaths.list, { replace: true });
      } finally {
        if (isMounted) {
          setLoadingCreditCard(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id, mode, navigate, showError]);

  const title = useMemo(
    () =>
      mode === "create"
        ? creditCardUiCopy.form.createTitle
        : creditCardUiCopy.form.editTitle,
    [mode],
  );

  function validate(nextValues: CreditCardFormValues) {
    const nextErrors: {
      name?: string;
      creditLimit?: string;
      dueDay?: string;
      closingDay?: string;
    } = {};

    if (!nextValues.name.trim()) {
      nextErrors.name = "Informe o nome do cartão.";
    }

    if (parseCurrencyValue(nextValues.creditLimit) <= 0) {
      nextErrors.creditLimit = "Informe um limite válido.";
    }

    const dueDay = Number(nextValues.dueDay);
    if (!nextValues.dueDay || dueDay < 1 || dueDay > 31) {
      nextErrors.dueDay = "Informe um dia de vencimento entre 1 e 31.";
    }

    const closingDay = Number(nextValues.closingDay);
    if (!nextValues.closingDay || closingDay < 1 || closingDay > 31) {
      nextErrors.closingDay = "Informe um dia de fechamento entre 1 e 31.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validation = validate(values);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    const payload =
      mode === "create"
        ? {
            create: true as const,
            data: {
              name: values.name.trim(),
              creditLimit: parseCurrencyValue(values.creditLimit),
              dueDay: Number(values.dueDay),
              closingDay: Number(values.closingDay),
              status: values.status,
            },
          }
        : {
            create: false as const,
            data: {
              idCreditCard: id ?? "",
              name: values.name.trim(),
              creditLimit: parseCurrencyValue(values.creditLimit),
              dueDay: Number(values.dueDay),
              closingDay: Number(values.closingDay),
              status: values.status,
            },
          };

    if (mode === "edit" && !id) {
      showError("Identificador inválido", "O cartão selecionado é inválido.");
      return;
    }

    const saved = await save(payload);
    if (saved) {
      navigate(creditCardRoutePaths.list);
    }
  }

  if (loadingCreditCard) {
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
      <SectionCard title={title}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Nome do cartão"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Ex: Nubank"
            required
            error={errors.name}
          />

          <Select
            label="Status"
            value={values.status ? "true" : "false"}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value === "true",
              }))
            }
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>

          <Input
            label="Limite total"
            value={values.creditLimit}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                creditLimit: maskCurrencyInput(event.target.value),
              }))
            }
            placeholder="0,00"
            inputMode="numeric"
            required
            error={errors.creditLimit}
          />

          <div>
            <Select
              label="Dia de fechamento da fatura"
              value={values.closingDay}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  closingDay: event.target.value,
                }))
              }
              required
              error={errors.closingDay}
            >
              <option value="">Selecione</option>
              {DAY_OPTIONS.map((day) => (
                <option key={day} value={day}>
                  Dia {day}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Select
              label="Dia de vencimento"
              value={values.dueDay}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  dueDay: event.target.value,
                }))
              }
              required
              error={errors.dueDay}
            >
              <option value="">Selecione</option>
              {DAY_OPTIONS.map((day) => (
                <option key={day} value={day}>
                  Dia {day}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs" style={{ color: colors.brown[500] }}>
              Compras feitas após o fechamento entram na fatura do ciclo
              seguinte, com vencimento no mês seguinte ao fechamento.
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
          onClick={() => navigate(creditCardRoutePaths.list)}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          {mode === "create" ? "Cadastrar cartão" : "Salvar cartão"}
        </Button>
      </div>
    </form>
  );
}
