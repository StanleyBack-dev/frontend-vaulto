import { useContext } from "react";
import { GoalsContext } from "./GoalsContext";

export function useGoalsContext() {
  const context = useContext(GoalsContext);

  if (!context) {
    throw new Error("useGoalsContext must be used within GoalsProvider");
  }

  return context;
}
