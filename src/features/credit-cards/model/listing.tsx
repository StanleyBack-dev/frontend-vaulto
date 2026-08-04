import type { CreditCard } from "@/api/credit-cards/schema";
import type { DataTableColumn } from "@/components/organisms/DataTable";
import EditIcon from "@/components/atoms/icons/EditIcon";

function formatCurrencyDisplay(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export function filterCreditCardsBySearch(
  creditCards: CreditCard[],
  search: string,
): CreditCard[] {
  const query = search.trim().toLowerCase();
  if (!query) return creditCards;

  return creditCards.filter((creditCard) =>
    creditCard.name.toLowerCase().includes(query),
  );
}

export function getCreditCardTableColumns(actions: {
  onEdit: (creditCard: CreditCard) => void;
}): DataTableColumn<CreditCard>[] {
  return [
    {
      key: "actions",
      label: "Ações",
      render: (creditCard) => (
        <button
          type="button"
          title="Editar"
          className="text-violet-700 transition hover:text-violet-900"
          onClick={(event) => {
            event.stopPropagation();
            actions.onEdit(creditCard);
          }}
        >
          <EditIcon size={18} />
        </button>
      ),
    },
    {
      key: "name",
      label: "Nome",
      render: (creditCard) => (
        <span className="text-sm font-semibold text-[#1a1333]">
          {creditCard.name}
        </span>
      ),
    },
    {
      key: "closingDay",
      label: "Dia de fechamento",
      render: (creditCard) => (
        <span className="text-sm text-[#1a1333]">
          Dia {creditCard.closingDay}
        </span>
      ),
    },
    {
      key: "dueDay",
      label: "Dia de vencimento",
      render: (creditCard) => (
        <span className="text-sm text-[#1a1333]">Dia {creditCard.dueDay}</span>
      ),
    },
    {
      key: "creditLimit",
      label: "Limite total",
      render: (creditCard) => (
        <span className="text-sm text-[#1a1333]">
          {formatCurrencyDisplay(creditCard.creditLimit)}
        </span>
      ),
    },
    {
      key: "usedLimit",
      label: "Limite usado",
      render: (creditCard) => (
        <span className="text-sm text-rose-700">
          {formatCurrencyDisplay(creditCard.usedLimit)}
        </span>
      ),
    },
    {
      key: "availableLimit",
      label: "Limite disponível",
      render: (creditCard) => (
        <span className="text-sm font-semibold text-emerald-700">
          {formatCurrencyDisplay(creditCard.availableLimit)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (creditCard) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            creditCard.status
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-rose-100 text-rose-800 border border-rose-300"
          }`}
        >
          {creditCard.status ? "Ativo" : "Inativo"}
        </span>
      ),
    },
  ];
}
