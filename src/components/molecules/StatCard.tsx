import React from "react";
import { colors, typography, radii } from "../../config";

type StatCardTone = "light" | "dark";

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  sub?: React.ReactNode;
  color?: string;
  tone?: StatCardTone;
  children?: React.ReactNode;
  className?: string;
}

// "dark" matches the card treatment already used across every report page
// (Dashboard's own stat cards, Comparativos, Reminders, etc.): bg #141225,
// border #3a2f5e, label #b7afcf. The value color is passed in by the
// caller (valueColor) rather than baked into the tone, since the same dark
// card hosts neutral values (white) and signed ones (emerald/rose) alike —
// see DebtsDashboardKanban's stat cards for the exact palette this mirrors.
const DARK_TONE = {
  background: "#141225",
  border: "#3a2f5e",
  label: "#b7afcf",
  sub: "#8b7fac",
};

export default function StatCard({
  icon,
  label,
  value,
  valueColor,
  sub,
  color = colors.gold[500],
  tone = "light",
  children,
  className = "",
}: StatCardProps) {
  const isDark = tone === "dark";

  const background = isDark ? DARK_TONE.background : colors.white;
  const borderColor = isDark ? DARK_TONE.border : colors.brown[100];
  const labelColor = isDark ? DARK_TONE.label : colors.brown[500];
  const resolvedValueColor =
    valueColor ?? (isDark ? "#f7f5ff" : colors.brown[800]);
  const subColor = isDark ? DARK_TONE.sub : colors.brown[300];
  const iconBg = color + "20";
  const iconColor = color;

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm sm:p-5 lg:p-6 ${className}`}
      style={{ background, borderColor, borderRadius: radii.lg }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <p
          className="pr-2 text-sm font-medium sm:text-[15px]"
          style={{ color: labelColor, fontFamily: typography.fontFamily }}
        >
          {label}
        </p>
        {icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11"
            style={{ background: iconBg, color: iconColor }}
          >
            {icon}
          </div>
        )}
      </div>
      <p
        className="mb-1 text-xl font-bold sm:text-2xl"
        style={{ color: resolvedValueColor, fontFamily: typography.fontFamily }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-xs"
          style={{ color: subColor, fontFamily: typography.fontFamily }}
        >
          {sub}
        </p>
      )}
      {children}
    </div>
  );
}
