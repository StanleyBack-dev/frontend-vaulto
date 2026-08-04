import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useDebts, type UseDebtsResult } from "@/hooks/debts/useDebts";

export const DebtsContext = createContext<UseDebtsResult | null>(null);

interface DebtsProviderProps {
  children: ReactNode;
}

export function DebtsProvider({ children }: DebtsProviderProps) {
  const debtsState = useDebts();

  return (
    <DebtsContext.Provider value={debtsState}>{children}</DebtsContext.Provider>
  );
}

export function DebtsProviderOutlet({ userId }: { userId?: string } = {}) {
  void userId;

  return (
    <DebtsProvider>
      <Outlet />
    </DebtsProvider>
  );
}
