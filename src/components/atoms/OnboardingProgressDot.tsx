import { colors } from "../../config";

interface OnboardingProgressDotProps {
  active: boolean;
}

export default function OnboardingProgressDot({
  active,
}: OnboardingProgressDotProps) {
  return (
    <span
      className="h-1.5 rounded-full transition-all duration-200"
      style={{
        width: active ? "1.5rem" : "0.375rem",
        background: active
          ? `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`
          : colors.brown[100],
      }}
    />
  );
}
