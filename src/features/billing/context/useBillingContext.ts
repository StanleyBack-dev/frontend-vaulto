import { useContext } from "react";
import { BillingContext } from "./BillingContext";

export function useBillingContext() {
  const context = useContext(BillingContext);

  if (!context) {
    throw new Error(
      "useBillingContext deve ser usado dentro de BillingProvider",
    );
  }

  return context;
}
