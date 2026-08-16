import DataTable from "@/components/organisms/DataTable";
import ConfirmDialog from "@molecules/ConfirmDialog";
import ExportButtons from "@/components/molecules/ExportButtons";
import FilterBar from "@/components/molecules/FilterBar";
import UpgradeBanner from "@molecules/UpgradeBanner";
import UpgradeModal from "@/components/organisms/UpgradeModal";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import Select from "@/components/atoms/Select";
import { colors } from "@/config";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { incomeRoutePaths } from "@/router";
import type { Income } from "@/api/incomes/schema";
import {
  filterIncomesBySearch,
  getIncomeTableColumns,
  incomeStatusOptions,
  incomeTypeOptions,
  useIncomesContext,
} from "@/features/incomes";
import {
  buildPlanLimitMessage,
  FREE_PLAN_LIMITS,
  useBillingContext,
} from "@/features/billing";

export default function Incomes() {
  const navigate = useNavigate();
  const {
    incomes,
    loading,
    saving,
    pagination,
    filters,
    setFilters,
    clearFilters,
    setLimit,
    nextPage,
    prevPage,
    incomeCategories,
    load,
    remove,
  } = useIncomesContext();
  const { isPro } = useBillingContext();

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [search, setSearch] = useState("");
  const [incomePendingDelete, setIncomePendingDelete] = useState<Income | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const isAtIncomeLimit =
    !isPro && pagination.total >= FREE_PLAN_LIMITS.INCOMES;

  const filteredIncomes = useMemo(
    () => filterIncomesBySearch(incomes, search),
    [incomes, search],
  );

  const columns = useMemo(
    () =>
      getIncomeTableColumns({
        onEdit: (income) => navigate(incomeRoutePaths.edit(income.idIncome)),
        onDelete: (income) => setIncomePendingDelete(income),
      }),
    [navigate],
  );

  async function handleConfirmDelete() {
    if (!incomePendingDelete) return;

    setIsDeleting(true);
    const deleted = await remove(incomePendingDelete.idIncome);
    setIsDeleting(false);

    if (deleted) {
      setIncomePendingDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      {!isPro && (
        <UpgradeBanner
          used={pagination.total}
          limit={FREE_PLAN_LIMITS.INCOMES}
          resourceLabel="receitas"
        />
      )}

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por título ou categoria"
        searchIcon={
          <SearchIcon size={16} style={{ color: colors.brown[300] }} />
        }
        action={{
          label: "Nova receita",
          onClick: () => {
            if (isAtIncomeLimit) {
              setIsUpgradeModalOpen(true);
              return;
            }
            navigate(incomeRoutePaths.create);
          },
          leftIcon: <Plus size={16} />,
        }}
      />

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#3a2f5e] bg-[#141225] p-3 md:grid-cols-4">
        <Select
          label="Status"
          value={filters.status}
          onChange={(event) => {
            void setFilters({
              status: event.target.value as typeof filters.status,
            });
          }}
        >
          <option value="">Todos</option>
          {incomeStatusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>

        <Select
          label="Tipo"
          value={filters.incomeType}
          onChange={(event) => {
            void setFilters({
              incomeType: event.target.value as typeof filters.incomeType,
            });
          }}
        >
          <option value="">Todos</option>
          {incomeTypeOptions.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>

        <Select
          label="Categoria"
          value={filters.idCategory}
          onChange={(event) => {
            void setFilters({ idCategory: event.target.value });
          }}
        >
          <option value="">Todas</option>
          {incomeCategories.map((cat) => (
            <option key={cat.idCategory} value={cat.idCategory}>
              {cat.name}
            </option>
          ))}
        </Select>

        <div className="flex items-end justify-end">
          <button
            type="button"
            onClick={() => {
              void clearFilters();
              setSearch("");
            }}
            className="rounded border border-[#3a2f5e] px-3 py-2 text-sm font-semibold text-[#c5bbeb] hover:bg-[#1f1832]"
          >
            Limpar filtros
          </button>
        </div>
      </div>

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
      ) : (
        <>
          <div className="mb-3 flex justify-end">
            <ExportButtons
              resource="incomes"
              filters={{
                incomeStatus: filters.status || undefined,
                incomeType: filters.incomeType || undefined,
                idCategory: filters.idCategory || undefined,
              }}
            />
          </div>
          <DataTable
            data={filteredIncomes}
            columns={columns}
            emptyMessage="Nenhuma receita encontrada"
            getId={(income) => income.idIncome}
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
        open={Boolean(incomePendingDelete)}
        title="Excluir receita"
        description={
          <>
            Tem certeza que deseja excluir a receita{" "}
            <strong>{incomePendingDelete?.title}</strong>? Todo o histórico de
            recebimentos, parcelas e demais dados associados a ela serão
            perdidos. Esta ação é irreversível.
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
        onCancel={() => setIncomePendingDelete(null)}
      />

      <UpgradeModal
        open={isUpgradeModalOpen}
        message={buildPlanLimitMessage("receitas", FREE_PLAN_LIMITS.INCOMES)}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
