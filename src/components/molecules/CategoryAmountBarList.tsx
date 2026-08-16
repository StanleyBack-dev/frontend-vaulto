import { colors, typography } from "../../config";

export interface CategoryAmountRow {
  idCategory: string;
  categoryName: string;
  amount: number;
}

interface CategoryAmountBarListProps {
  rows: CategoryAmountRow[];
  color: string;
  emptyMessage: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export default function CategoryAmountBarList({
  rows,
  color,
  emptyMessage,
}: CategoryAmountBarListProps) {
  const sorted = rows
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const max = sorted[0]?.amount ?? 0;

  if (sorted.length === 0) {
    return (
      <p className="text-sm" style={{ color: colors.brown[500] }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((row) => (
        <div key={row.idCategory}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span
              className="truncate"
              style={{
                color: colors.brown[800],
                fontFamily: typography.fontFamily,
              }}
            >
              {row.categoryName || "Sem categoria"}
            </span>
            <span
              className="shrink-0 font-semibold"
              style={{
                color: colors.brown[800],
                fontFamily: typography.fontFamily,
              }}
            >
              {formatCurrency(row.amount)}
            </span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full"
            style={{ background: colors.brown[100] }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${max > 0 ? (row.amount / max) * 100 : 0}%`,
                background: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
