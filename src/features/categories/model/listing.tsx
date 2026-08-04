import type { Category } from "@/api/categories/schema";
import type { DataTableColumn } from "@/components/organisms/DataTable";
import EditIcon from "@/components/atoms/icons/EditIcon";

export function filterCategoriesBySearch(
  categories: Category[],
  search: string,
): Category[] {
  const query = search.trim().toLowerCase();
  if (!query) return categories;

  return categories.filter((category) =>
    category.name.toLowerCase().includes(query),
  );
}

export function getCategoryTableColumns(actions: {
  onEdit: (category: Category) => void;
}): DataTableColumn<Category>[] {
  return [
    {
      key: "actions",
      label: "Ações",
      render: (category) => (
        <button
          type="button"
          title="Editar"
          className="text-violet-700 transition hover:text-violet-900"
          onClick={(event) => {
            event.stopPropagation();
            actions.onEdit(category);
          }}
        >
          <EditIcon size={18} />
        </button>
      ),
    },
    {
      key: "name",
      label: "Nome",
      render: (category) => (
        <span className="text-sm font-semibold text-[#1a1333]">
          {category.name}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (category) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            category.status
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-rose-100 text-rose-800 border border-rose-300"
          }`}
        >
          {category.status ? "Ativa" : "Inativa"}
        </span>
      ),
    },
  ];
}
