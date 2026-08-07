import type { ReactNode } from "react";
import { colors, typography } from "../../config";

interface OnboardingStepContentProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
}

export default function OnboardingStepContent({
  icon,
  title,
  description,
}: OnboardingStepContentProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-2 text-center">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
          color: "#fff",
        }}
      >
        {icon}
      </div>
      <div>
        <h2
          className="text-lg font-bold"
          style={{
            color: colors.brown[800],
            fontFamily: typography.fontFamily,
          }}
        >
          {title}
        </h2>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{
            color: colors.brown[500],
            fontFamily: typography.fontFamily,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
