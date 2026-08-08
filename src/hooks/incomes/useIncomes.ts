import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Category } from "@/api/categories/schema";
import type {
  CreateIncomePayload,
  Income,
  IncomeStatus,
  IncomeType,
  UpdateIncomeDetailsPayload,
  UpdateIncomeStatusPayload,
} from "@/api/incomes/schema";
import type { PaginationMeta } from "@/api/shared/contracts";
import { PlanLimitReachedError } from "@/api/shared/plan-limit-error";
import { fetchCategories } from "@/features/categories/services/category.service";
import {
  fetchIncomes,
  removeIncome,
  saveIncome,
  saveIncomeDetails,
  saveIncomeStatus,
} from "@/features/incomes/services/income.service";
import { incomeUiCopy } from "@/features/incomes/model/messages";
import { useToast } from "@/shared/toast/useToast";

interface IncomeFilters {
  status: "" | IncomeStatus;
  incomeType: "" | IncomeType;
  idCategory: string;
}

export interface UseIncomesResult {
  incomes: Income[];
  incomeCategories: Category[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  planLimitMessage: string | null;
  dismissPlanLimitMessage: () => void;
  pagination: PaginationMeta;
  filters: IncomeFilters;
  load: () => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: Partial<IncomeFilters>) => Promise<void>;
  clearFilters: () => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  create: (payload: CreateIncomePayload) => Promise<Income | null>;
  updateStatus: (payload: UpdateIncomeStatusPayload) => Promise<Income | null>;
  updateDetails: (
    payload: UpdateIncomeDetailsPayload,
  ) => Promise<Income | null>;
  remove: (idIncome: string) => Promise<boolean>;
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
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function readFilters(searchParams: URLSearchParams): IncomeFilters {
  const status = (searchParams.get("status") || "") as IncomeFilters["status"];
  const incomeType = (searchParams.get("incomeType") ||
    "") as IncomeFilters["incomeType"];
  const idCategory = searchParams.get("idCategory") || "";

  return { status, incomeType, idCategory };
}

function applyOptionalSearchParam(
  params: URLSearchParams,
  key: string,
  value?: string,
) {
  if (value) {
    params.set(key, value);
    return;
  }

  params.delete(key);
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function useIncomes(): UseIncomesResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planLimitMessage, setPlanLimitMessage] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<PaginationMeta>(EMPTY_PAGINATION);
  const { showError, showSuccess } = useToast();

  const dismissPlanLimitMessage = useCallback(() => {
    setPlanLimitMessage(null);
  }, []);

  const currentPage = toPositiveInt(searchParams.get("page"), 1);
  const currentLimit = toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchIncomes({
        page: currentPage,
        limit: currentLimit,
        status: filters.status || undefined,
        incomeType: filters.incomeType || undefined,
        idCategory: filters.idCategory || undefined,
      });

      setIncomes(data.items);
      setPagination(data.pagination);
    } catch (err) {
      const message = toErrorMessage(
        err,
        incomeUiCopy.errors.loadIncomesFallback,
      );
      setError(message);
      showError(incomeUiCopy.errors.loadIncomesFallback, message);
    } finally {
      setLoading(false);
    }
  }, [
    currentLimit,
    currentPage,
    filters.incomeType,
    filters.idCategory,
    filters.status,
    showError,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const activeIncomeCategories = await fetchCategories({
          page: 1,
          limit: 100,
          status: true,
          type: "INCOME",
        });
        setIncomeCategories(activeIncomeCategories.items);
      } catch {
        setIncomeCategories([]);
      }
    })();
  }, []);

  const setPage = useCallback(
    async (page: number) => {
      const safePage = Math.max(1, page);
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set("page", String(safePage));
        next.set("limit", String(currentLimit));
        return next;
      });
    },
    [currentLimit, setSearchParams],
  );

  const setLimit = useCallback(
    async (limit: number) => {
      const safeLimit = Math.max(1, limit);
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set("page", "1");
        next.set("limit", String(safeLimit));
        return next;
      });
    },
    [setSearchParams],
  );

  const setFilters = useCallback(
    async (nextFilters: Partial<IncomeFilters>) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        const merged = { ...readFilters(previous), ...nextFilters };

        next.set("page", "1");
        next.set("limit", String(currentLimit));
        applyOptionalSearchParam(next, "status", merged.status);
        applyOptionalSearchParam(next, "incomeType", merged.incomeType);
        applyOptionalSearchParam(next, "idCategory", merged.idCategory);
        return next;
      });
    },
    [currentLimit, setSearchParams],
  );

  const clearFilters = useCallback(async () => {
    await setFilters({ status: "", incomeType: "", idCategory: "" });
  }, [setFilters]);

  const nextPage = useCallback(async () => {
    if (!pagination.hasNextPage) {
      return;
    }

    await setPage(pagination.currentPage + 1);
  }, [pagination.currentPage, pagination.hasNextPage, setPage]);

  const prevPage = useCallback(async () => {
    if (pagination.currentPage <= 1) {
      return;
    }

    await setPage(pagination.currentPage - 1);
  }, [pagination.currentPage, setPage]);

  const create = useCallback(
    async (payload: CreateIncomePayload) => {
      setSaving(true);
      setError(null);

      try {
        const created = await saveIncome(payload);
        showSuccess(incomeUiCopy.success.createIncome);
        await load();
        return created;
      } catch (err) {
        if (err instanceof PlanLimitReachedError) {
          setPlanLimitMessage(err.message);
          return null;
        }

        const message = toErrorMessage(
          err,
          incomeUiCopy.errors.saveIncomeFallback,
        );
        setError(message);
        showError(incomeUiCopy.errors.saveIncomeFallback, message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  const updateStatus = useCallback(
    async (payload: UpdateIncomeStatusPayload) => {
      setSaving(true);
      setError(null);

      try {
        const updated = await saveIncomeStatus(payload);
        showSuccess(incomeUiCopy.success.updateIncomeStatus);
        await load();
        return updated;
      } catch (err) {
        const message = toErrorMessage(
          err,
          incomeUiCopy.errors.updateStatusFallback,
        );
        setError(message);
        showError(incomeUiCopy.errors.updateStatusFallback, message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  const updateDetails = useCallback(
    async (payload: UpdateIncomeDetailsPayload) => {
      setSaving(true);
      setError(null);

      try {
        const updated = await saveIncomeDetails(payload);
        showSuccess(incomeUiCopy.success.updateIncomeDetails);
        await load();
        return updated;
      } catch (err) {
        const message = toErrorMessage(
          err,
          incomeUiCopy.errors.updateDetailsFallback,
        );
        setError(message);
        showError(incomeUiCopy.errors.updateDetailsFallback, message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  const remove = useCallback(
    async (idIncome: string) => {
      setSaving(true);
      setError(null);

      try {
        await removeIncome(idIncome);
        showSuccess(incomeUiCopy.success.deleteIncome);
        await load();
        return true;
      } catch (err) {
        const message = toErrorMessage(
          err,
          incomeUiCopy.errors.deleteIncomeFallback,
        );
        setError(message);
        showError(incomeUiCopy.errors.deleteIncomeFallback, message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  return {
    incomes,
    incomeCategories,
    loading,
    saving,
    error,
    planLimitMessage,
    dismissPlanLimitMessage,
    pagination,
    filters,
    load,
    setPage,
    setLimit,
    setFilters,
    clearFilters,
    nextPage,
    prevPage,
    create,
    updateStatus,
    updateDetails,
    remove,
  };
}
