import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/api/categories/schema";
import type { PaginationMeta } from "@/api/shared/contracts";
import {
  fetchCategories,
  saveCategory,
} from "@/features/categories/services/category.service";
import { categoryUiCopy } from "@/features/categories/model/messages";
import { useToast } from "@/shared/toast/useToast";

export interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  pagination: PaginationMeta;
  load: () => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  save: (
    payload:
      | { create: true; data: CreateCategoryPayload }
      | { create: false; data: UpdateCategoryPayload },
  ) => Promise<Category | null>;
}

const DEFAULT_LIMIT = 10;
const EMPTY_PAGINATION: PaginationMeta = {
  total: 0,
  currentPage: 1,
  limit: DEFAULT_LIMIT,
  totalPages: 0,
  hasNextPage: false,
};

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useCategories(): UseCategoriesResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<PaginationMeta>(EMPTY_PAGINATION);
  const { showError, showSuccess } = useToast();

  const currentPage = toPositiveInt(searchParams.get("page"), 1);
  const currentLimit = toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCategories({
        page: currentPage,
        limit: currentLimit,
      });
      setCategories(data.items);
      setPagination(data.pagination);
    } catch (err) {
      const message = toErrorMessage(
        err,
        categoryUiCopy.errors.loadCategoriesFallback,
      );
      setError(message);
      showError(categoryUiCopy.errors.loadCategoriesFallback, message);
    } finally {
      setLoading(false);
    }
  }, [currentLimit, currentPage, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const setPage = useCallback(
    async (page: number) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set("page", String(Math.max(1, page)));
        next.set("limit", String(currentLimit));
        return next;
      });
    },
    [currentLimit, setSearchParams],
  );

  const setLimit = useCallback(
    async (limit: number) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set("page", "1");
        next.set("limit", String(Math.max(1, limit)));
        return next;
      });
    },
    [setSearchParams],
  );

  const nextPage = useCallback(async () => {
    if (pagination.hasNextPage) {
      await setPage(pagination.currentPage + 1);
    }
  }, [pagination.currentPage, pagination.hasNextPage, setPage]);

  const prevPage = useCallback(async () => {
    if (pagination.currentPage > 1) {
      await setPage(pagination.currentPage - 1);
    }
  }, [pagination.currentPage, setPage]);

  const save = useCallback<UseCategoriesResult["save"]>(
    async (payload) => {
      setSaving(true);
      setError(null);

      try {
        const saved = await saveCategory(payload);
        showSuccess(
          payload.create
            ? categoryUiCopy.success.createCategory
            : categoryUiCopy.success.updateCategory,
        );
        await load();
        return saved;
      } catch (err) {
        const message = toErrorMessage(
          err,
          categoryUiCopy.errors.saveCategoryFallback,
        );
        setError(message);
        showError(categoryUiCopy.errors.saveCategoryFallback, message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  return {
    categories,
    loading,
    saving,
    error,
    pagination,
    load,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    save,
  };
}
