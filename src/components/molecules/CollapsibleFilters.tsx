import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { colors } from "@/config";

type CollapsibleFiltersTone = "dark" | "light";

interface CollapsibleFiltersProps {
  children: ReactNode;
  title?: string;
  defaultOpen?: boolean;
  tone?: CollapsibleFiltersTone;
  /** When greater than zero, shows a small badge with the number of active filters. */
  activeCount?: number;
  className?: string;
}

const toneStyles: Record<
  CollapsibleFiltersTone,
  {
    container: string;
    trigger: string;
    title: string;
    badge: string;
    body: string;
  }
> = {
  dark: {
    container: "rounded-xl border border-[#3a2f5e] bg-[#141225]",
    trigger: "text-[#c5bbeb] hover:bg-[#1f1832]",
    title: "text-[#f7f5ff]",
    badge: "bg-[#3a2f5e] text-[#e8e2ff]",
    body: "border-t border-[#3a2f5e] p-3",
  },
  light: {
    container: "rounded-2xl border border-[#e8d5c9] bg-[#faf6f2]",
    trigger: "text-[#7a5c4e] hover:bg-[#f1e7de]",
    title: "text-[#4a3f6b]",
    badge: "bg-[#e8d5c9] text-[#7a5c4e]",
    body: "border-t border-[#e8d5c9] p-4",
  },
};

export default function CollapsibleFilters({
  children,
  title = "Filtros",
  defaultOpen = false,
  tone = "dark",
  activeCount = 0,
  className = "",
}: CollapsibleFiltersProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const styles = toneStyles[tone];

  return (
    <div className={`${styles.container} ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls={bodyId}
        className={`flex w-full items-center justify-between gap-3 rounded-[inherit] px-4 py-3 text-left text-sm font-semibold transition-colors ${styles.trigger}`}
      >
        <span className={`flex items-center gap-2 ${styles.title}`}>
          {title}
          {activeCount > 0 && (
            <span
              className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${styles.badge}`}
            >
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform duration-200"
          style={{
            color: tone === "dark" ? "#c5bbeb" : colors.brown[500],
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {open && (
        <div id={bodyId} className={styles.body}>
          {children}
        </div>
      )}
    </div>
  );
}
