import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { colors, radii, typography } from "../../config";

interface SettingsLinkItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export default function SettingsLinkItem({
  icon,
  title,
  description,
  onClick,
}: SettingsLinkItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors duration-200 hover:bg-[#faf6f2]"
      style={{ borderColor: colors.brown[100], borderRadius: radii.md }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: colors.gold[500] + "20", color: colors.gold[600] }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-semibold sm:text-[15px]"
          style={{
            color: colors.brown[800],
            fontFamily: typography.fontFamily,
          }}
        >
          {title}
        </p>
        <p
          className="mt-0.5 text-xs sm:text-sm"
          style={{
            color: colors.brown[500],
            fontFamily: typography.fontFamily,
          }}
        >
          {description}
        </p>
      </div>
      <ChevronRight
        size={18}
        className="shrink-0"
        style={{ color: colors.brown[500] }}
      />
    </button>
  );
}
