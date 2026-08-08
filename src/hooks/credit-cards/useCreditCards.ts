import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  CreditCard,
  CreateCreditCardPayload,
  UpdateCreditCardPayload,
} from "@/api/credit-cards/schema";
import type { PaginationMeta } from "@/api/shared/contracts";
import { PlanLimitReachedError } from "@/api/shared/plan-limit-error";
import {
  fetchCreditCards,
  saveCreditCard,
} from "@/features/credit-cards/services/credit-card.service";
import { creditCardUiCopy } from "@/features/credit-cards/model/messages";
import { useToast } from "@/shared/toast/useToast";

export interface UseCreditCardsResult {
  creditCards: CreditCard[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  planLimitMessage: string | null;
  dismissPlanLimitMessage: () => void;
  pagination: PaginationMeta;
  load: () => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  save: (
    payload:
      | { create: true; data: CreateCreditCardPayload }
      | { create: false; data: UpdateCreditCardPayload },
  ) => Promise<CreditCard | null>;
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

export function useCreditCards(): UseCreditCardsResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCreditCards({
        page: currentPage,
        limit: currentLimit,
      });
      setCreditCards(data.items);
      setPagination(data.pagination);
    } catch (err) {
      const message = toErrorMessage(
        err,
        creditCardUiCopy.errors.loadCreditCardsFallback,
      );
      setError(message);
      showError(creditCardUiCopy.errors.loadCreditCardsFallback, message);
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

  const save = useCallback<UseCreditCardsResult["save"]>(
    async (payload) => {
      setSaving(true);
      setError(null);

      try {
        const saved = await saveCreditCard(payload);
        showSuccess(
          payload.create
            ? creditCardUiCopy.success.createCreditCard
            : creditCardUiCopy.success.updateCreditCard,
        );
        await load();
        return saved;
      } catch (err) {
        if (err instanceof PlanLimitReachedError) {
          setPlanLimitMessage(err.message);
          return null;
        }

        const message = toErrorMessage(
          err,
          creditCardUiCopy.errors.saveCreditCardFallback,
        );
        setError(message);
        showError(creditCardUiCopy.errors.saveCreditCardFallback, message);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [load, showError, showSuccess],
  );

  return {
    creditCards,
    loading,
    saving,
    error,
    planLimitMessage,
    dismissPlanLimitMessage,
    pagination,
    load,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    save,
  };
}
