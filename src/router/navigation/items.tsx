import type { ReactNode } from "react";
import type { ActiveView } from "../../types/views";
import DebtsIcon from "../../components/atoms/icons/DebtsIcon";
import {
  CreditCard,
  LayoutDashboard,
  Receipt,
  Tags,
  User,
  Shield,
  Wallet,
} from "lucide-react";

export interface NavigationItem {
  id: ActiveView;
  label: string;
  icon: ReactNode;
}

export const primaryNavigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "debts", label: "Dívidas", icon: <DebtsIcon size={20} /> },
  { id: "debtsStatement", label: "Extrato", icon: <Receipt size={20} /> },
  { id: "payments", label: "Pagamentos", icon: <Wallet size={20} /> },
  { id: "categories", label: "Categorias", icon: <Tags size={20} /> },
  {
    id: "creditCards",
    label: "Cartões de Crédito",
    icon: <CreditCard size={20} />,
  },
  { id: "users", label: "Usuários", icon: <Shield size={20} /> },
];

export const secondaryNavigationItems: NavigationItem[] = [
  { id: "profile", label: "Perfil", icon: <User size={20} /> },
];
