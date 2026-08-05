import type { PageAccessKey } from "../../../api/users/schema";
import { getDefaultPagePermissionsByGroup } from "./group-defaults";

export interface PagePermissionOption {
  key: PageAccessKey;
  label: string;
}

export const pagePermissionOptions: PagePermissionOption[] = [
  { key: "DASHBOARD", label: "Dashboard" },
  { key: "CATEGORIES", label: "Categorias" },
  { key: "DEBTS", label: "Dívidas" },
  { key: "DEBTS_STATEMENT", label: "Extrato de Dívidas" },
  { key: "INCOMES", label: "Receitas" },
  { key: "PAYMENTS", label: "Pagamentos" },
  { key: "INCOME_RECEIPTS", label: "Recebimentos" },
  { key: "CREDIT_CARDS", label: "Cartões de Crédito" },
  { key: "USERS", label: "Usuários" },
];

export { getDefaultPagePermissionsByGroup };
