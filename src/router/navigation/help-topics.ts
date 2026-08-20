import type { ActiveView } from "../../types/views";

// Maps each non-admin view to its topic id inside the Manual page
// (src/pages/Manual.tsx). "admin" and "faq" (the Manual page itself) are
// intentionally left out — views with no entry here get no help icon.
export const manualTopicByView: Partial<Record<ActiveView, string>> = {
  dashboard: "dashboard",
  debts: "dividas",
  debtsStatement: "extratos",
  incomes: "receitas",
  payments: "pagamentos",
  incomeReceipts: "recebimentos",
  categories: "categorias",
  creditCards: "cartoes",
  profile: "perfil",
  plans: "planos",
  forecast: "previsao",
  calendar: "calendario",
  reminders: "lembretes",
  goals: "metas",
  goalContributions: "contribuicoes-metas",
  comparisons: "comparativos",
  financialHealth: "saude-financeira",
  support: "suporte",
  termsOfUse: "termos-de-uso",
  referrals: "indique-e-ganhe",
  referralWallet: "indique-e-ganhe",
};
