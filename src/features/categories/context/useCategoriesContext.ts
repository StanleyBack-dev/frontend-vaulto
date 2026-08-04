import { useContext } from "react";
import { CategoriesContext } from "./CategoriesContext";

export function useCategoriesContext() {
  const context = useContext(CategoriesContext);

  if (!context) {
    throw new Error(
      "useCategoriesContext must be used within CategoriesProvider",
    );
  }

  return context;
}
