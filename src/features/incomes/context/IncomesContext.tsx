import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useIncomes, type UseIncomesResult } from "@/hooks/incomes/useIncomes";

export const IncomesContext = createContext<UseIncomesResult | null>(null);

interface IncomesProviderProps {
  children: ReactNode;
}

export function IncomesProvider({ children }: IncomesProviderProps) {
  const incomesState = useIncomes();

  return (
    <IncomesContext.Provider value={incomesState}>
      {children}
    </IncomesContext.Provider>
  );
}

export function IncomesProviderOutlet({ userId }: { userId?: string } = {}) {
  void userId;

  return (
    <IncomesProvider>
      <Outlet />
    </IncomesProvider>
  );
}
