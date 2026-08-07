import { completeOnboardingTour as completeOnboardingTourRequest } from "../../../api/auth/methods/completeOnboardingTour";

export async function completeOnboardingTour(): Promise<void> {
  await completeOnboardingTourRequest();
}
