import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@/components/atoms/icons/SearchIcon";
import Select from "@/components/atoms/Select";
import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import { colors } from "@/config";
import {
  categoryTypeOptions,
  categoryUiCopy,
  filterCategoriesBySearch,
  getCategoryTableColumns,
  useCategoriesContext,
} from "@/features/categories";
import type { CategoryType } from "@/api/categories/schema";
import { categoryRoutePaths } from "@/router";

export default function Categories() {
  const navigate = useNavigate();
  const {
    categories,
    loading,
    pagination,
    setLimit,
    nextPage,
    prevPage,
    load,
  } = useCategoriesContext();

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");
  const [typeFilter, setTypeFilter] = useState<"" | CategoryType>("");

  const filteredCategories = useMemo(() => {
    let result = filterCategoriesBySearch(categories, search);
    if (statusFilter !== "") {
      const active = statusFilter === "true";
      result = result.filter((c) => c.status === active);
    }
    if (typeFilter !== "") {
      result = result.filter((c) => c.type === typeFilter);
    }
    return result;
  }, [categories, search, statusFilter, typeFilter]);

  const columns = useMemo(
    () =>
      getCategoryTableColumns({
        onEdit: (category) =>
          navigate(categoryRoutePaths.edit(category.idCategory)),
      }),
    [navigate],
  );

  return (
    <div className="space-y-4">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={categoryUiCopy.listing.searchPlaceholder}
        searchIcon={
          <SearchIcon size={16} style={{ color: colors.brown[300] }} />
        }
        action={{
          label: categoryUiCopy.listing.newAction,
          onClick: () => navigate(categoryRoutePaths.create),
          leftIcon: <Plus size={16} />,
        }}
      />

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#3a2f5e] bg-[#141225] p-3 md:grid-cols-4">
        <Select
          label="Status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "" | "true" | "false")
          }
        >
          <option value="">Todos</option>
          <option value="true">Ativa</option>
          <option value="false">Inativa</option>
        </Select>

        <Select
          label="Tipo"
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as "" | CategoryType)
          }
        >
          <option value="">Todos</option>
          {categoryTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <div className="md:col-span-2 flex items-end justify-end">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("");
              setTypeFilter("");
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
          <DataTable
            data={filteredCategories}
            columns={columns}
            emptyMessage={categoryUiCopy.listing.emptyMessage}
            getId={(category) => category.idCategory}
          />
          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
            style={{ color: "#4a3f6b" }}
          >
            <span>
              Página {pagination.currentPage} de{" "}
              {Math.max(pagination.totalPages, 1)}
              {" - "}
              {pagination.total} registros
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
                disabled={loading || pagination.currentPage <= 1}
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
                disabled={loading || !pagination.hasNextPage}
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
