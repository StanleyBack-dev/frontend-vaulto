import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  useCreditCards,
  type UseCreditCardsResult,
} from "@/hooks/credit-cards/useCreditCards";

export const CreditCardsContext = createContext<UseCreditCardsResult | null>(
  null,
);

interface CreditCardsProviderProps {
  children: ReactNode;
}

export function CreditCardsProvider({ children }: CreditCardsProviderProps) {
  const creditCardsState = useCreditCards();

  return (
    <CreditCardsContext.Provider value={creditCardsState}>
      {children}
    </CreditCardsContext.Provider>
  );
}

export function CreditCardsProviderOutlet({
  userId,
}: { userId?: string } = {}) {
  void userId;

  return (
    <CreditCardsProvider>
      <Outlet />
    </CreditCardsProvider>
  );
}
