import { useContext } from "react";
import { IncomesContext } from "./IncomesContext";

export function useIncomesContext() {
  const context = useContext(IncomesContext);

  if (!context) {
    throw new Error("useIncomesContext must be used within IncomesProvider");
  }

  return context;
}
