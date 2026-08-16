import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useGoals, type UseGoalsResult } from "@/hooks/goals/useGoals";

export const GoalsContext = createContext<UseGoalsResult | null>(null);

interface GoalsProviderProps {
  children: ReactNode;
}

export function GoalsProvider({ children }: GoalsProviderProps) {
  const goalsState = useGoals();

  return (
    <GoalsContext.Provider value={goalsState}>{children}</GoalsContext.Provider>
  );
}

export function GoalsProviderOutlet({ userId }: { userId?: string } = {}) {
  void userId;

  return (
    <GoalsProvider>
      <Outlet />
    </GoalsProvider>
  );
}
