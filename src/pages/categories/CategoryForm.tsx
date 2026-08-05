import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import SectionCard from "@/components/organisms/SectionCard";
import { colors } from "@/config";
import {
  categoryTypeOptions,
  categoryUiCopy,
  emptyCategoryFormValues,
  fetchCategoryById,
  mapCategoryToFormValues,
  type CategoryFormValues,
  useCategoriesContext,
} from "@/features/categories";
import type { CategoryType } from "@/api/categories/schema";
import { categoryRoutePaths } from "@/router";
import { useToast } from "@/shared/toast/useToast";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function CategoryForm({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showError } = useToast();
  const { save, saving } = useCategoriesContext();
  const [values, setValues] = useState<CategoryFormValues>(
    emptyCategoryFormValues,
  );
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [loadingCategory, setLoadingCategory] = useState(mode === "edit");

  useEffect(() => {
    if (mode !== "edit" || !id) {
      return;
    }

    let isMounted = true;

    void (async () => {
      setLoadingCategory(true);
      try {
        const category = await fetchCategoryById(id);
        if (!isMounted) return;
        setValues(mapCategoryToFormValues(category));
      } catch (error) {
        if (!isMounted) return;
        const message = toErrorMessage(
          error,
          "Não foi possível carregar a categoria.",
        );
        showError("Falha ao carregar categoria", message);
        navigate(categoryRoutePaths.list, { replace: true });
      } finally {
        if (isMounted) {
          setLoadingCategory(false);
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
        ? categoryUiCopy.form.createTitle
        : categoryUiCopy.form.editTitle,
    [mode],
  );

  function validate(nextValues: CategoryFormValues) {
    if (!nextValues.name.trim()) {
      return { name: "Informe o nome da categoria." };
    }

    return {};
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
              type: values.type,
              status: values.status,
            },
          }
        : {
            create: false as const,
            data: {
              idCategory: id ?? "",
              name: values.name.trim(),
              type: values.type,
              status: values.status,
            },
          };

    if (mode === "edit" && !id) {
      showError(
        "Identificador inválido",
        "A categoria selecionada é inválida.",
      );
      return;
    }

    const saved = await save(payload);
    if (saved) {
      navigate(categoryRoutePaths.list);
    }
  }

  if (loadingCategory) {
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
            label="Nome"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Ex: Moradia"
            required
            error={errors.name}
          />

          <Select
            label="Tipo"
            value={values.type}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                type: event.target.value as CategoryType,
              }))
            }
          >
            {categoryTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

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
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </Select>
        </div>
      </SectionCard>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
          onClick={() => navigate(categoryRoutePaths.list)}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          {mode === "create" ? "Cadastrar categoria" : "Salvar categoria"}
        </Button>
      </div>
    </form>
  );
}
