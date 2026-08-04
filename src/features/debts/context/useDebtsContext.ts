import { useContext } from "react";
import { DebtsContext } from "./DebtsContext";

export function useDebtsContext() {
  const context = useContext(DebtsContext);

  if (!context) {
    throw new Error("useDebtsContext must be used within DebtsProvider");
  }

  return context;
}
