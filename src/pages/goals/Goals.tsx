import DataTable from "@/components/organisms/DataTable";
import ConfirmDialog from "@molecules/ConfirmDialog";
import FilterBar from "@/components/molecules/FilterBar";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import Button from "@/components/atoms/Button";
import Loading from "@/components/atoms/Loading";
import SectionCard from "@/components/organisms/SectionCard";
import { colors } from "@/config";
import { Crown, Plus, Target, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { goalRoutePaths, planRoutePaths } from "@/router";
import type { FinancialGoal } from "@/api/goals/schema";
import {
  filterGoalsBySearch,
  getGoalTableColumns,
  goalUiCopy,
  useGoalsContext,
} from "@/features/goals";
import { useBillingContext } from "@/features/billing";

export default function Goals() {
  const navigate = useNavigate();
  const { subscription, isLoading: isSubscriptionLoading } =
    useBillingContext();
  const {
    goals,
    loading,
    saving,
    pagination,
    setLimit,
    nextPage,
    prevPage,
    load,
    remove,
  } = useGoalsContext();

  const isPro = subscription?.plan === "PRO";

  useEffect(() => {
    if (isPro) {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const [search, setSearch] = useState("");
  const [goalPendingDelete, setGoalPendingDelete] =
    useState<FinancialGoal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredGoals = useMemo(
    () => filterGoalsBySearch(goals, search),
    [goals, search],
  );

  const columns = useMemo(
    () =>
      getGoalTableColumns({
        onEdit: (goal) => navigate(goalRoutePaths.edit(goal.idFinancialGoal)),
        onDelete: (goal) => setGoalPendingDelete(goal),
      }),
    [navigate],
  );

  async function handleConfirmDelete() {
    if (!goalPendingDelete) return;

    setIsDeleting(true);
    const deleted = await remove(goalPendingDelete.idFinancialGoal);
    setIsDeleting(false);

    if (deleted) {
      setGoalPendingDelete(null);
    }
  }

  if (isSubscriptionLoading) {
    return (
      <div className="flex h-56 items-center justify-center">
        <Loading label="Carregando..." />
      </div>
    );
  }

  if (!isPro) {
    return (
      <SectionCard
        title={goalUiCopy.proGate.title}
        description={goalUiCopy.proGate.description}
      >
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
              color: "#fff",
            }}
          >
            <Crown size={26} />
          </div>
          <p
            className="max-w-md text-sm leading-relaxed"
            style={{ color: colors.brown[500] }}
          >
            {goalUiCopy.proGate.message}
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate(planRoutePaths.list)}
          >
            {goalUiCopy.proGate.action}
          </Button>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={goalUiCopy.listing.searchPlaceholder}
        searchIcon={
          <SearchIcon size={16} style={{ color: colors.brown[300] }} />
        }
        action={{
          label: goalUiCopy.listing.newAction,
          onClick: () => navigate(goalRoutePaths.create),
          leftIcon: <Plus size={16} />,
        }}
      />

      {loading ? (
        <div className="flex items-center justify-center h-56">
          <div
            className="w-9 h-9 rounded-full border-2 animate-spin"
            style={{
              borderColor: colors.gold[500],
              borderTopColor: "transparent",
            }}
          />
        </div>
      ) : filteredGoals.length === 0 && !search ? (
        <SectionCard
          title={goalUiCopy.listing.title}
          description="Nenhuma meta cadastrada ainda."
        >
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
                color: "#fff",
              }}
            >
              <Target size={26} />
            </div>
            <p
              className="max-w-md text-sm leading-relaxed"
              style={{ color: colors.brown[500] }}
            >
              Cadastre sua primeira meta financeira para começar a acompanhar
              seu progresso.
            </p>
            <Button
              type="button"
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate(goalRoutePaths.create)}
            >
              {goalUiCopy.listing.newAction}
            </Button>
          </div>
        </SectionCard>
      ) : (
        <>
          <DataTable
            data={filteredGoals}
            columns={columns}
            emptyMessage={goalUiCopy.listing.emptyMessage}
            getId={(goal) => goal.idFinancialGoal}
          />
          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
            style={{ color: "#4a3f6b" }}
          >
            <span>
              Página {pagination.currentPage} de{" "}
              {Math.max(pagination.totalPages, 1)} - {pagination.total}{" "}
              registros
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <span>Itens:</span>
                <select
                  className="rounded border border-[#3a2f5e] bg-[#141225] px-2 py-1"
                  style={{ color: colors.white }}
                  value={pagination.limit}
                  onChange={(event) => {
                    void setLimit(Number(event.target.value));
                  }}
                  disabled={loading}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
              <button
                type="button"
                className="rounded border border-[#3a2f5e] px-3 py-1 disabled:opacity-50"
                style={{ color: "#4a3f6b" }}
                onClick={() => {
                  void prevPage();
                }}
                disabled={loading || pagination.currentPage <= 1 || saving}
              >
                Anterior
              </button>
              <button
                type="button"
                className="rounded border border-[#3a2f5e] px-3 py-1 disabled:opacity-50"
                style={{ color: "#4a3f6b" }}
                onClick={() => {
                  void nextPage();
                }}
                disabled={loading || !pagination.hasNextPage || saving}
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(goalPendingDelete)}
        title="Excluir meta"
        description={
          <>
            Tem certeza que deseja excluir a meta{" "}
            <strong>{goalPendingDelete?.title}</strong>? Todo o histórico de
            contribuições será perdido. Esta ação é irreversível.
          </>
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        icon={<Trash2 size={20} />}
        loading={isDeleting}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        onCancel={() => setGoalPendingDelete(null)}
      />
    </div>
  );
}
