import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  CreateFinancialGoalPayload,
  FinancialGoal,
  UpdateFinancialGoalPayload,
} from "@/api/goals/schema";
import type { PaginationMeta } from "@/api/shared/contracts";
import {
  fetchGoals,
  removeGoal,
  saveGoal,
  saveGoalDetails,
} from "@/features/goals/services/goal.service";
import { goalUiCopy } from "@/features/goals/model/messages";
import { useToast } from "@/shared/toast/useToast";

export interface UseGoalsResult {
  goals: FinancialGoal[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  pagination: PaginationMeta;
  load: () => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  create: (
    payload: CreateFinancialGoalPayload,
  ) => Promise<FinancialGoal | null>;
  updateDetails: (
    payload: UpdateFinancialGoalPayload,
  ) => Promise<FinancialGoal | null>;
  remove: (idFinancialGoal: string) => Promise<boolean>;
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

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function useGoals(): UseGoalsResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
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
      const data = await fetchGoals({
        page: currentPage,
        limit: currentLimit,
      });

      setGoals(data.items);
      setPagination(data.pagination);
    } catch (err) {
      const message = toErrorMessage(err, goalUiCopy.errors.loadGoalsFallback);
      setError(message);
      showError(goalUiCopy.errors.loadGoalsFallback, message);
    } finally {
      setLoading(false);
    }
  }, [currentLimit, currentPage, showError]);

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
    async (payload: CreateFinancialGoalPayload) => {
      setSaving(true);
      setError(null);

      try {
        const created = await saveGoal(payload);
        showSuccess(goalUiCopy.success.createGoal);
        await load();
        return created;
      } catch (err) {
        const message = toErrorMessage(
          err,
          goalUiCopy.errors.saveGoalFallback,
        );
        setError(message);
        showError(goalUiCopy.errors.saveGoalFallback, message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  const updateDetails = useCallback(
    async (payload: UpdateFinancialGoalPayload) => {
      setSaving(true);
      setError(null);

      try {
        const updated = await saveGoalDetails(payload);
        showSuccess(goalUiCopy.success.updateGoal);
        await load();
        return updated;
      } catch (err) {
        const message = toErrorMessage(
          err,
          goalUiCopy.errors.saveGoalFallback,
        );
        setError(message);
        showError(goalUiCopy.errors.saveGoalFallback, message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  const remove = useCallback(
    async (idFinancialGoal: string) => {
      setSaving(true);
      setError(null);

      try {
        await removeGoal(idFinancialGoal);
        showSuccess(goalUiCopy.success.deleteGoal);
        await load();
        return true;
      } catch (err) {
        const message = toErrorMessage(
          err,
          goalUiCopy.errors.deleteGoalFallback,
        );
        setError(message);
        showError(goalUiCopy.errors.deleteGoalFallback, message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  return {
    goals,
    loading,
    saving,
    error,
    pagination,
    load,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    create,
    updateDetails,
    remove,
  };
}
