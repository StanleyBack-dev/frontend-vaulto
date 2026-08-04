import { createContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import {
  useCategories,
  type UseCategoriesResult,
} from "@/hooks/categories/useCategories";

export const CategoriesContext = createContext<UseCategoriesResult | null>(
  null,
);

interface CategoriesProviderProps {
  children: ReactNode;
}

export function CategoriesProvider({ children }: CategoriesProviderProps) {
  const categoriesState = useCategories();

  return (
    <CategoriesContext.Provider value={categoriesState}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function CategoriesProviderOutlet({ userId }: { userId?: string } = {}) {
  void userId;

  return (
    <CategoriesProvider>
      <Outlet />
    </CategoriesProvider>
  );
}
