import { Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { colors } from "@/config";
import { planRoutePaths } from "@/router";

interface UpgradeBannerProps {
  used: number;
  limit: number;
  resourceLabel: string;
}

export default function UpgradeBanner({
  used,
  limit,
  resourceLabel,
}: UpgradeBannerProps) {
  const percentage =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const isAtLimit = used >= limit;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#3a2f5e] bg-[#141225] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: colors.white }}>
            {used} de {limit} {resourceLabel} usados no plano Free
          </span>
          <span
            className="font-semibold"
            style={{ color: isAtLimit ? "#f87171" : colors.gold[500] }}
          >
            {percentage}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1f1832]">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${percentage}%`,
              background: isAtLimit ? "#f87171" : colors.gold[500],
            }}
          />
        </div>
      </div>
      <Link
        to={planRoutePaths.list}
        className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        style={{
          background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
        }}
      >
        <Crown size={14} />
        Assinar Vaulto Pro
      </Link>
    </div>
  );
}
