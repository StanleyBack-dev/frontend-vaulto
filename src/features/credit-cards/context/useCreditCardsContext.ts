import { useContext } from "react";
import { CreditCardsContext } from "./CreditCardsContext";

export function useCreditCardsContext() {
  const context = useContext(CreditCardsContext);

  if (!context) {
    throw new Error(
      "useCreditCardsContext must be used within CreditCardsProvider",
    );
  }

  return context;
}
