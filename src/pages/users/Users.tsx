import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import Select from "@/components/atoms/Select";
import { colors } from "@/config";
import {
  fetchUserFilterOptions,
  getUserTableColumns,
  userGroupSelectOptions,
  userUiCopy,
} from "@/features/users";
import type { UserFilterOption } from "@/api/users/schema";
import { useUsersContext } from "@/features/users/context/useUsersContext";
import { userRoutePaths } from "@/router";

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(values.filter((value): value is string => !!value)),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export default function Users() {
  const navigate = useNavigate();
  const {
    users,
    loading,
    pagination,
    filters,
    setFilters,
    clearFilters,
    setLimit,
    nextPage,
    prevPage,
    load,
  } = useUsersContext();

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [filterOptions, setFilterOptions] = useState<UserFilterOption[]>([]);

  useEffect(() => {
    let cancelled = false;

    void fetchUserFilterOptions()
      .then((options) => {
        if (!cancelled) {
          setFilterOptions(options);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFilterOptions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const nameOptions = useMemo(
    () => uniqueSorted(filterOptions.map((option) => option.name)),
    [filterOptions],
  );
  const emailOptions = useMemo(
    () => uniqueSorted(filterOptions.map((option) => option.email)),
    [filterOptions],
  );
  const usernameOptions = useMemo(
    () => uniqueSorted(filterOptions.map((option) => option.username)),
    [filterOptions],
  );

  const columns = useMemo(
    () =>
      getUserTableColumns({
        onEdit: (user) => navigate(userRoutePaths.edit(user.idUsers)),
      }),
    [navigate],
  );

  return (
    <div className="space-y-4">
      <FilterBar
        action={{
          label: userUiCopy.listing.newAction,
          onClick: () => navigate(userRoutePaths.create),
          leftIcon: <Plus size={16} />,
        }}
      />

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#3a2f5e] bg-[#141225] p-3 md:grid-cols-3 lg:grid-cols-6">
        <Select
          label="Nome"
          value={filters.name}
          onChange={(event) => {
            void setFilters({ name: event.target.value });
          }}
        >
          <option value="">Todos</option>
          {nameOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>

        <Select
          label="Email"
          value={filters.email}
          onChange={(event) => {
            void setFilters({ email: event.target.value });
          }}
        >
          <option value="">Todos</option>
          {emailOptions.map((email) => (
            <option key={email} value={email}>
              {email}
            </option>
          ))}
        </Select>

        <Select
          label="Username"
          value={filters.username}
          onChange={(event) => {
            void setFilters({ username: event.target.value });
          }}
        >
          <option value="">Todos</option>
          {usernameOptions.map((username) => (
            <option key={username} value={username}>
              {username}
            </option>
          ))}
        </Select>

        <Select
          label="Grupo"
          value={filters.group}
          onChange={(event) => {
            void setFilters({
              group: event.target.value as typeof filters.group,
            });
          }}
        >
          <option value="">Todos</option>
          {userGroupSelectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          label="Ativo"
          value={filters.status}
          onChange={(event) => {
            void setFilters({
              status: event.target.value as typeof filters.status,
            });
          }}
        >
          <option value="">Todos</option>
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </Select>

        <div className="flex items-end justify-end">
          <button
            type="button"
            onClick={() => {
              void clearFilters();
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
            data={users}
            columns={columns}
            emptyMessage={userUiCopy.listing.emptyMessage}
            getId={(user) => user.idUsers}
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
