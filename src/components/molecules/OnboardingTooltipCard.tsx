import type { ReactNode } from "react";
import { X } from "lucide-react";
import Button from "@atoms/Button";
import OnboardingProgressDots from "@molecules/OnboardingProgressDots";
import { colors, radii, typography } from "../../config";

interface OnboardingTooltipCardProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  stepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

export default function OnboardingTooltipCard({
  icon,
  title,
  description,
  stepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  onNext,
  onPrevious,
  onSkip,
}: OnboardingTooltipCardProps) {
  return (
    <div
      className="relative w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border bg-white shadow-2xl"
      style={{ borderColor: colors.brown[100], borderRadius: radii.lg }}
    >
      <button
        type="button"
        onClick={onSkip}
        aria-label="Pular apresentação"
        className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3 p-4 pr-9">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
            color: "#fff",
          }}
        >
          {icon}
        </div>
        <div className="min-w-0 pt-1">
          <h3
            className="text-sm font-bold"
            style={{
              color: colors.brown[800],
              fontFamily: typography.fontFamily,
            }}
          >
            {title}
          </h3>
          <p
            className="mt-1 text-xs leading-relaxed"
            style={{
              color: colors.brown[500],
              fontFamily: typography.fontFamily,
            }}
          >
            {description}
          </p>
        </div>
      </div>

      <div
        className="flex flex-col gap-3 border-t px-4 py-3"
        style={{ borderColor: colors.brown[100] }}
      >
        <OnboardingProgressDots total={totalSteps} activeIndex={stepIndex} />
        <div className="flex items-center justify-between gap-3">
          {isFirstStep ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
              onClick={onSkip}
            >
              Pular
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
              onClick={onPrevious}
            >
              Voltar
            </Button>
          )}
          <Button type="button" variant="primary" size="sm" onClick={onNext}>
            {isLastStep ? "Concluir" : "Próximo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
