import { PLAN_FEATURE_ROWS } from "@/features/billing";
import { colors, typography } from "../../config";

export default function PlanComparisonTable() {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={{ borderColor: colors.brown[100] }}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr style={{ background: colors.black[800] }}>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white sm:px-6">
                Recurso
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white sm:px-6">
                Free
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sm:px-6"
                style={{ color: colors.gold[500] }}
              >
                Pro
              </th>
            </tr>
          </thead>
          <tbody>
            {PLAN_FEATURE_ROWS.map((row, index) => (
              <tr
                key={row.label}
                style={{
                  background: index % 2 === 0 ? "#fff" : "#faf6f2",
                }}
              >
                <td
                  className="px-4 py-3 font-medium sm:px-6"
                  style={{
                    color: colors.brown[800],
                    fontFamily: typography.fontFamily,
                  }}
                >
                  {row.label}
                </td>
                <td
                  className="px-4 py-3 sm:px-6"
                  style={{ color: colors.brown[500] }}
                >
                  {row.free}
                </td>
                <td
                  className="px-4 py-3 font-semibold sm:px-6"
                  style={{ color: colors.brown[800] }}
                >
                  {row.pro}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
