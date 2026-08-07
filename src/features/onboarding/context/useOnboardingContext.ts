import { useContext } from "react";
import { OnboardingContext } from "./OnboardingContext";

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      "useOnboardingContext deve ser usado dentro de OnboardingProvider",
    );
  }

  return context;
}
