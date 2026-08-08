import type { ReactNode } from "react";
import type { ActiveView } from "../../types/views";
import DebtsIcon from "../../components/atoms/icons/DebtsIcon";
import {
  Banknote,
  Bell,
  CalendarDays,
  CreditCard,
  Crown,
  HandCoins,
  HelpCircle,
  LayoutDashboard,
  Receipt,
  Tags,
  TrendingUp,
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
  { id: "debtsStatement", label: "Extratos", icon: <Receipt size={20} /> },
  { id: "incomes", label: "Receitas", icon: <Banknote size={20} /> },
  {
    id: "forecast",
    label: "Previsão financeira",
    icon: <TrendingUp size={20} />,
  },
  {
    id: "calendar",
    label: "Calendário financeiro",
    icon: <CalendarDays size={20} />,
  },
  { id: "payments", label: "Pagamentos", icon: <Wallet size={20} /> },
  {
    id: "incomeReceipts",
    label: "Recebimentos",
    icon: <HandCoins size={20} />,
  },
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
  { id: "plans", label: "Planos", icon: <Crown size={20} /> },
  { id: "reminders", label: "Lembretes", icon: <Bell size={20} /> },
  { id: "faq", label: "Ajuda", icon: <HelpCircle size={20} /> },
];
