import type { ReactNode } from "react";
import {
  Banknote,
  CreditCard,
  HandCoins,
  LayoutDashboard,
  PartyPopper,
  Sparkles,
  Tags,
  Wallet,
} from "lucide-react";
import DebtsIcon from "@atoms/icons/DebtsIcon";
import type { ActiveView } from "@/types/views";
import {
  categoryRoutePaths,
  creditCardRoutePaths,
  dashboardRoutePaths,
  debtRoutePaths,
  incomeReceiptRoutePaths,
  incomeRoutePaths,
  paymentRoutePaths,
} from "@/router/navigation";

export interface OnboardingStep {
  id: string;
  title: string;
  description: ReactNode;
  icon: ReactNode;
  /** Rota para a qual o tour navega ao chegar neste passo. Ausente = permanece na página atual (intro/conclusão). */
  route?: string;
  /** View correspondente na navegação lateral, usada para ancorar o spotlight e checar permissão de acesso. */
  navView?: ActiveView;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Vaulto!",
    description:
      "Vamos te mostrar rapidinho como controlar suas dívidas e receitas em um só lugar. Leva menos de um minuto e você pode pular quando quiser.",
    icon: <Sparkles size={24} />,
  },
  {
    id: "dashboard",
    title: "Sua visão geral",
    description:
      "O Dashboard mostra todas as suas dívidas organizadas por situação — Em aberto, Vencidas, Parcialmente pagas e Pagas — além de um resumo de quanto você já recebeu e pagou no mês.",
    icon: <LayoutDashboard size={20} />,
    route: dashboardRoutePaths.list,
    navView: "dashboard",
  },
  {
    id: "debts",
    title: "Cadastre o que você precisa pagar",
    description:
      "Aqui você cadastra contas, compras e empréstimos, à vista ou parcelados. Se a dívida estiver vinculada a um cartão de crédito, o vencimento é calculado automaticamente.",
    icon: <DebtsIcon size={20} />,
    route: debtRoutePaths.list,
    navView: "debts",
  },
  {
    id: "payments",
    title: "Registre o que você já pagou",
    description:
      "Sempre que pagar uma parcela, registre aqui. O status da dívida é atualizado sozinho, e você pode editar ou excluir um pagamento quando quiser.",
    icon: <Wallet size={20} />,
    route: paymentRoutePaths.list,
    navView: "payments",
  },
  {
    id: "incomes",
    title: "Cadastre o que você tem a receber",
    description:
      "Salário, freelances ou qualquer entrada esperada entram aqui. Assim como as dívidas, podem ser parceladas ou marcadas como recorrentes.",
    icon: <Banknote size={20} />,
    route: incomeRoutePaths.list,
    navView: "incomes",
  },
  {
    id: "income-receipts",
    title: "Confirme o que você recebeu",
    description:
      "Funciona como Pagamentos, só que para receitas: confirme aqui, total ou parcialmente, quando o dinheiro realmente entrar.",
    icon: <HandCoins size={20} />,
    route: incomeReceiptRoutePaths.list,
    navView: "incomeReceipts",
  },
  {
    id: "categories",
    title: "Organize com categorias",
    description:
      "Use categorias como \"Moradia\" ou \"Salário\" para agrupar e filtrar suas dívidas e receitas.",
    icon: <Tags size={20} />,
    route: categoryRoutePaths.list,
    navView: "categories",
  },
  {
    id: "credit-cards",
    title: "Cartões sob controle",
    description:
      "Cadastre seus cartões aqui. Ao vincular uma dívida a um deles, o Vaulto calcula sozinho em qual fatura ela cai e verifica o limite disponível.",
    icon: <CreditCard size={20} />,
    route: creditCardRoutePaths.list,
    navView: "creditCards",
  },
  {
    id: "done",
    title: "Pronto! Você já sabe o essencial",
    description:
      "Sempre que precisar, o guia completo e as perguntas frequentes estão disponíveis em Ajuda, no menu lateral. Vamos começar?",
    icon: <PartyPopper size={24} />,
  },
];
