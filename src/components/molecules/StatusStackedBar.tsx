import { colors, typography } from "../../config";

export interface StatusStackedBarSegment {
  key: string;
  label: string;
  count: number;
  color: string;
}

interface StatusStackedBarProps {
  segments: StatusStackedBarSegment[];
  emptyMessage: string;
}

export default function StatusStackedBar({
  segments,
  emptyMessage,
}: StatusStackedBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const visibleSegments = segments.filter((segment) => segment.count > 0);

  if (total === 0) {
    return (
      <p className="text-sm" style={{ color: colors.brown[500] }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      <div
        className="flex h-4 w-full gap-[2px] overflow-hidden rounded-full"
        style={{ background: colors.brown[100] }}
      >
        {visibleSegments.map((segment, index) => (
          <div
            key={segment.key}
            title={`${segment.label}: ${segment.count}`}
            style={{
              flex: `${segment.count} 0 0%`,
              background: segment.color,
            }}
            className={`h-full ${index === 0 ? "rounded-l-full" : ""} ${
              index === visibleSegments.length - 1 ? "rounded-r-full" : ""
            }`}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: segment.color }}
            />
            <span
              className="truncate text-xs"
              style={{
                color: colors.brown[500],
                fontFamily: typography.fontFamily,
              }}
            >
              {segment.label}
            </span>
            <span
              className="ml-auto shrink-0 text-xs font-semibold"
              style={{
                color: colors.brown[800],
                fontFamily: typography.fontFamily,
              }}
            >
              {segment.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
