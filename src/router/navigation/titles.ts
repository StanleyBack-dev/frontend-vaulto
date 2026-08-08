import type { ActiveView } from "../../types/views";

export const viewTitles: Record<
  ActiveView,
  { title: string; subtitle: string }
> = {
  dashboard: { title: "Dashboard", subtitle: "Visão geral das dívidas" },
  debts: { title: "Dívidas", subtitle: "Contas a pagar e receber" },
  debtsStatement: {
    title: "Extratos",
    subtitle: "Extrato detalhado de dívidas, receitas ou ambas por período",
  },
  incomes: {
    title: "Receitas",
    subtitle: "Cadastro e controle de entradas de dinheiro",
  },
  payments: {
    title: "Pagamentos",
    subtitle: "Registro de pagamentos de parcelas",
  },
  incomeReceipts: {
    title: "Recebimentos",
    subtitle: "Registro de recebimentos de parcelas de receitas",
  },
  categories: { title: "Categorias", subtitle: "Cadastro de categorias" },
  creditCards: {
    title: "Cartões de Crédito",
    subtitle: "Cadastro de cartões e limites",
  },
  users: {
    title: "Usuários",
    subtitle: "Gerenciar usuários de acesso",
  },
  profile: { title: "Perfil", subtitle: "Seus dados e sua assinatura" },
  plans: {
    title: "Planos",
    subtitle: "Compare o Free e o Vaulto Pro e escolha o seu",
  },
  forecast: {
    title: "Previsão financeira",
    subtitle: "Quanto você pode gastar com segurança no período",
  },
  calendar: {
    title: "Calendário financeiro",
    subtitle: "Dívidas e receitas organizadas por dia de vencimento",
  },
  reminders: {
    title: "Lembretes",
    subtitle: "O que vence amanhã, e como avisamos você por e-mail",
  },
  faq: {
    title: "Manual do Sistema",
    subtitle:
      "Guia de uso, dúvidas frequentes e regras de cada área do sistema",
  },
};
