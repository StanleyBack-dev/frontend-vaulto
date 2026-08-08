import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Category } from "@/api/categories/schema";
import type { CreditCard } from "@/api/credit-cards/schema";
import type {
  CreateDebtPayload,
  Debt,
  DebtStatus,
  DebtType,
  UpdateDebtDetailsPayload,
  UpdateDebtStatusPayload,
} from "@/api/debts/schema";
import type { PaginationMeta } from "@/api/shared/contracts";
import { PlanLimitReachedError } from "@/api/shared/plan-limit-error";
import { fetchCategories } from "@/features/categories/services/category.service";
import { fetchCreditCards } from "@/features/credit-cards/services/credit-card.service";
import {
  fetchDebts,
  removeDebt,
  saveDebt,
  saveDebtDetails,
  saveDebtStatus,
} from "@/features/debts/services/debt.service";
import { debtUiCopy } from "@/features/debts/model/messages";
import { useToast } from "@/shared/toast/useToast";

interface DebtFilters {
  status: "" | DebtStatus;
  debtType: "" | DebtType;
  idCategory: string;
  dueDateFrom: string;
  dueDateTo: string;
}

export interface UseDebtsResult {
  debts: Debt[];
  debtCategories: Category[];
  debtCreditCards: CreditCard[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  planLimitMessage: string | null;
  dismissPlanLimitMessage: () => void;
  pagination: PaginationMeta;
  filters: DebtFilters;
  load: () => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: Partial<DebtFilters>) => Promise<void>;
  clearFilters: () => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  create: (payload: CreateDebtPayload) => Promise<Debt | null>;
  updateStatus: (payload: UpdateDebtStatusPayload) => Promise<Debt | null>;
  updateDetails: (payload: UpdateDebtDetailsPayload) => Promise<Debt | null>;
  remove: (idDebt: string) => Promise<boolean>;
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

function readFilters(searchParams: URLSearchParams): DebtFilters {
  const status = (searchParams.get("status") || "") as DebtFilters["status"];
  const debtType = (searchParams.get("debtType") ||
    "") as DebtFilters["debtType"];
  const idCategory = searchParams.get("idCategory") || "";
  const dueDateFrom = searchParams.get("dueDateFrom") || "";
  const dueDateTo = searchParams.get("dueDateTo") || "";

  return { status, debtType, idCategory, dueDateFrom, dueDateTo };
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

export function useDebts(): UseDebtsResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [debtCategories, setDebtCategories] = useState<Category[]>([]);
  const [debtCreditCards, setDebtCreditCards] = useState<CreditCard[]>([]);
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
      const data = await fetchDebts({
        page: currentPage,
        limit: currentLimit,
        status: filters.status || undefined,
        debtType: filters.debtType || undefined,
        idCategory: filters.idCategory || undefined,
        dueDateFrom: filters.dueDateFrom || undefined,
        dueDateTo: filters.dueDateTo || undefined,
      });

      setDebts(data.items);
      setPagination(data.pagination);
    } catch (err) {
      const message = toErrorMessage(err, debtUiCopy.errors.loadDebtsFallback);
      setError(message);
      showError(debtUiCopy.errors.loadDebtsFallback, message);
    } finally {
      setLoading(false);
    }
  }, [
    currentLimit,
    currentPage,
    filters.debtType,
    filters.idCategory,
    filters.status,
    filters.dueDateFrom,
    filters.dueDateTo,
    showError,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const activeCategories = await fetchCategories({
          page: 1,
          limit: 100,
          status: true,
        });
        setDebtCategories(activeCategories.items);
      } catch {
        setDebtCategories([]);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const activeCreditCards = await fetchCreditCards({
          page: 1,
          limit: 100,
          status: true,
        });
        setDebtCreditCards(activeCreditCards.items);
      } catch {
        setDebtCreditCards([]);
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
    async (nextFilters: Partial<DebtFilters>) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        const merged = { ...readFilters(previous), ...nextFilters };

        next.set("page", "1");
        next.set("limit", String(currentLimit));
        applyOptionalSearchParam(next, "status", merged.status);
        applyOptionalSearchParam(next, "debtType", merged.debtType);
        applyOptionalSearchParam(next, "idCategory", merged.idCategory);
        applyOptionalSearchParam(next, "dueDateFrom", merged.dueDateFrom);
        applyOptionalSearchParam(next, "dueDateTo", merged.dueDateTo);
        return next;
      });
    },
    [currentLimit, setSearchParams],
  );

  const clearFilters = useCallback(async () => {
    await setFilters({
      status: "",
      debtType: "",
      idCategory: "",
      dueDateFrom: "",
      dueDateTo: "",
    });
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
    async (payload: CreateDebtPayload) => {
      setSaving(true);
      setError(null);

      try {
        const created = await saveDebt(payload);
        showSuccess(debtUiCopy.success.createDebt);
        await load();
        return created;
      } catch (err) {
        if (err instanceof PlanLimitReachedError) {
          setPlanLimitMessage(err.message);
          return null;
        }

        const message = toErrorMessage(err, debtUiCopy.errors.saveDebtFallback);
        setError(message);
        showError(debtUiCopy.errors.saveDebtFallback, message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  const updateStatus = useCallback(
    async (payload: UpdateDebtStatusPayload) => {
      setSaving(true);
      setError(null);

      try {
        const updated = await saveDebtStatus(payload);
        showSuccess(debtUiCopy.success.updateDebtStatus);
        await load();
        return updated;
      } catch (err) {
        const message = toErrorMessage(
          err,
          debtUiCopy.errors.updateStatusFallback,
        );
        setError(message);
        showError(debtUiCopy.errors.updateStatusFallback, message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  const updateDetails = useCallback(
    async (payload: UpdateDebtDetailsPayload) => {
      setSaving(true);
      setError(null);

      try {
        const updated = await saveDebtDetails(payload);
        showSuccess(debtUiCopy.success.updateDebtDetails);
        await load();
        return updated;
      } catch (err) {
        const message = toErrorMessage(
          err,
          debtUiCopy.errors.updateDetailsFallback,
        );
        setError(message);
        showError(debtUiCopy.errors.updateDetailsFallback, message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  const remove = useCallback(
    async (idDebt: string) => {
      setSaving(true);
      setError(null);

      try {
        await removeDebt(idDebt);
        showSuccess(debtUiCopy.success.deleteDebt);
        await load();
        return true;
      } catch (err) {
        const message = toErrorMessage(
          err,
          debtUiCopy.errors.deleteDebtFallback,
        );
        setError(message);
        showError(debtUiCopy.errors.deleteDebtFallback, message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  return {
    debts,
    debtCategories,
    debtCreditCards,
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
