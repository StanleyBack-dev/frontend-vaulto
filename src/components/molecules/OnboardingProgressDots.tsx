import OnboardingProgressDot from "@atoms/OnboardingProgressDot";

interface OnboardingProgressDotsProps {
  total: number;
  activeIndex: number;
}

export default function OnboardingProgressDots({
  total,
  activeIndex,
}: OnboardingProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, index) => (
        <OnboardingProgressDot key={index} active={index === activeIndex} />
      ))}
    </div>
  );
}
