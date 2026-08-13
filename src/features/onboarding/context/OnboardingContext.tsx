import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthSession } from "../../auth/context/useAuthSession";
import { onboardingSteps, type OnboardingStep } from "../model/steps";
import { completeOnboardingTour } from "../services/onboarding.service";

interface OnboardingContextValue {
  isOpen: boolean;
  currentStep: OnboardingStep;
  stepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  skipTour: () => void;
  restartTour: () => void;
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(
  null,
);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { session, hasPageAccess, markOnboardingTourCompleted } =
    useAuthSession();
  const navigate = useNavigate();
  const location = useLocation();

  const steps = useMemo(
    () =>
      onboardingSteps.filter(
        (step) => !step.navView || hasPageAccess(step.navView),
      ),
    [hasPageAccess],
  );

  const [manualOpen, setManualOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // The onboarding tour only makes sense once the terms gate has been
  // cleared — otherwise both full-screen overlays would race to open at
  // once right after login.
  const isOpen =
    manualOpen ||
    (Boolean(session) &&
      Boolean(session?.termsAccepted) &&
      !session?.onboardingTourCompleted);

  useEffect(() => {
    setStepIndex(0);
    setManualOpen(false);
  }, [session?.user.idUsers]);

  useEffect(() => {
    if (!isOpen || steps.length === 0) return;

    const step = steps[Math.min(stepIndex, steps.length - 1)];

    if (step?.route && location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [isOpen, stepIndex, steps, location.pathname, navigate]);

  const finishTour = useCallback(() => {
    setManualOpen(false);
    markOnboardingTourCompleted();
    void completeOnboardingTour().catch(() => {
      // Falha silenciosa: o tour já foi fechado localmente e a preferência
      // é reaplicada no próximo carregamento de sessão a partir do backend.
    });
  }, [markOnboardingTourCompleted]);

  const goToNextStep = useCallback(() => {
    setStepIndex((current) => {
      if (current >= steps.length - 1) {
        finishTour();
        return current;
      }

      return current + 1;
    });
  }, [steps.length, finishTour]);

  const goToPreviousStep = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1));
  }, []);

  const restartTour = useCallback(() => {
    setStepIndex(0);
    setManualOpen(true);
  }, []);

  const value = useMemo<OnboardingContextValue>(() => {
    const totalSteps = steps.length;
    const safeIndex = totalSteps > 0 ? Math.min(stepIndex, totalSteps - 1) : 0;
    const currentStep = steps[safeIndex] ?? onboardingSteps[0];

    return {
      isOpen: isOpen && totalSteps > 0,
      currentStep,
      stepIndex: safeIndex,
      totalSteps,
      isFirstStep: safeIndex === 0,
      isLastStep: safeIndex === totalSteps - 1,
      goToNextStep,
      goToPreviousStep,
      skipTour: finishTour,
      restartTour,
    };
  }, [
    isOpen,
    stepIndex,
    steps,
    goToNextStep,
    goToPreviousStep,
    finishTour,
    restartTour,
  ]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
