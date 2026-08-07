import { useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Button from "@atoms/Button";
import OnboardingProgressDots from "@molecules/OnboardingProgressDots";
import OnboardingStepContent from "@molecules/OnboardingStepContent";
import OnboardingTooltipCard from "@molecules/OnboardingTooltipCard";
import { useOnboardingContext } from "@/features/onboarding";
import { useIsDesktopViewport } from "@/features/onboarding/hooks/useIsDesktopViewport";
import { useTourTargetRect } from "@/features/onboarding/hooks/useTourTargetRect";
import { colors, radii } from "../../config";

const SPOTLIGHT_PADDING = 8;
const EDGE_MARGIN = 16;
const TARGET_GAP = 16;
const FALLBACK_TOOLTIP_SIZE = { width: 320, height: 180 };

export default function OnboardingTour() {
  const {
    isOpen,
    currentStep,
    stepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    skipTour,
  } = useOnboardingContext();

  const isDesktop = useIsDesktopViewport();
  const hasTarget = Boolean(currentStep.navView);
  const selector = !hasTarget
    ? null
    : isDesktop
      ? `[data-tour-nav="${currentStep.navView}"]`
      : "[data-tour-header]";

  const { rect, isSearching } = useTourTargetRect(selector);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const measured = tooltipRef.current.getBoundingClientRect();
      setTooltipSize({ width: measured.width, height: measured.height });
    } else {
      setTooltipSize({ width: 0, height: 0 });
    }
  }, [currentStep.id, rect, isDesktop]);

  if (!isOpen) return null;

  if (hasTarget && isSearching) {
    return <div className="fixed inset-0 z-[100] bg-[#06050d]/30" />;
  }

  if (hasTarget && rect) {
    const placement = isDesktop ? "right" : "bottom";
    const size = tooltipSize.width ? tooltipSize : FALLBACK_TOOLTIP_SIZE;
    const position = computeTooltipPosition(rect, placement, size);

    return (
      <div className="fixed inset-0 z-[100]">
        <div
          className="absolute inset-0"
          onClick={(event) => event.stopPropagation()}
        />
        <div
          className="pointer-events-none fixed rounded-xl transition-all duration-300 ease-out"
          style={{
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
            boxShadow: "0 0 0 9999px rgba(6,5,13,0.72)",
            border: `2px solid ${colors.gold[500]}`,
          }}
        />
        <div
          ref={tooltipRef}
          className="fixed transition-all duration-300 ease-out"
          style={{
            top: position.top,
            left: position.left,
            visibility: tooltipSize.width ? "visible" : "hidden",
          }}
        >
          <OnboardingTooltipCard
            icon={currentStep.icon}
            title={currentStep.title}
            description={currentStep.description}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            onSkip={skipTour}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#06050d]/70 backdrop-blur-sm transition-opacity" />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-2xl"
        style={{ borderColor: colors.brown[100], borderRadius: radii.lg }}
      >
        <button
          type="button"
          onClick={skipTour}
          aria-label="Pular apresentação"
          className="absolute right-4 top-4 z-20 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <div className="px-6 pb-4 pt-10">
          <OnboardingStepContent
            icon={currentStep.icon}
            title={currentStep.title}
            description={currentStep.description}
          />
        </div>

        <div
          className="flex flex-col gap-4 border-t px-6 py-4"
          style={{ borderColor: colors.brown[100] }}
        >
          <OnboardingProgressDots total={totalSteps} activeIndex={stepIndex} />

          <div className="flex items-center justify-between gap-3">
            {isFirstStep ? (
              <Button
                type="button"
                variant="outline"
                className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                onClick={skipTour}
              >
                Pular
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
                onClick={goToPreviousStep}
              >
                Voltar
              </Button>
            )}
            <Button type="button" variant="primary" onClick={goToNextStep}>
              {isLastStep ? "Começar a usar" : "Próximo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function computeTooltipPosition(
  rect: DOMRect,
  placement: "right" | "bottom",
  size: { width: number; height: number },
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top: number;
  let left: number;

  if (placement === "right") {
    top = rect.top + rect.height / 2 - size.height / 2;
    left = rect.right + TARGET_GAP;

    if (left + size.width > viewportWidth - EDGE_MARGIN) {
      left = Math.max(rect.left - size.width - TARGET_GAP, EDGE_MARGIN);
    }
  } else {
    top = rect.bottom + TARGET_GAP;
    left = rect.left + rect.width / 2 - size.width / 2;
  }

  top = Math.min(
    Math.max(top, EDGE_MARGIN),
    Math.max(viewportHeight - size.height - EDGE_MARGIN, EDGE_MARGIN),
  );
  left = Math.min(
    Math.max(left, EDGE_MARGIN),
    Math.max(viewportWidth - size.width - EDGE_MARGIN, EDGE_MARGIN),
  );

  return { top, left };
}
