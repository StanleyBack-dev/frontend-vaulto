import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { colors, radii, typography } from "../../config";

interface PlanPriceCardProps {
  title: string;
  price: string;
  priceSuffix: string;
  hint?: string;
  features: string[];
  highlighted?: boolean;
  footer?: ReactNode;
}

export default function PlanPriceCard({
  title,
  price,
  priceSuffix,
  hint,
  features,
  highlighted = false,
  footer,
}: PlanPriceCardProps) {
  return (
    <div
      className="flex flex-col rounded-2xl border p-6"
      style={{
        borderColor: highlighted ? colors.gold[500] : colors.brown[100],
        borderWidth: highlighted ? 2 : 1,
        borderRadius: radii.lg,
        background: highlighted
          ? `linear-gradient(180deg, ${colors.gold[500]}0f, #fff)`
          : "#fff",
      }}
    >
      <h3
        className="text-base font-bold"
        style={{ color: colors.brown[800], fontFamily: typography.fontFamily }}
      >
        {title}
      </h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span
          className="text-3xl font-bold"
          style={{ color: colors.brown[800] }}
        >
          {price}
        </span>
        <span className="text-sm" style={{ color: colors.brown[500] }}>
          {priceSuffix}
        </span>
      </div>
      {hint && (
        <p
          className="mt-1 text-xs font-semibold"
          style={{ color: colors.gold[600] }}
        >
          {hint}
        </p>
      )}

      <ul className="mt-5 flex-1 space-y-2.5">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm"
            style={{
              color: colors.brown[800],
              fontFamily: typography.fontFamily,
            }}
          >
            <Check
              size={16}
              className="mt-0.5 shrink-0"
              style={{ color: colors.gold[600] }}
            />
            {feature}
          </li>
        ))}
      </ul>

      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
}
