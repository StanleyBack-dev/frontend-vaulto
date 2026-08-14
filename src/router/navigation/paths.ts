import type { ActiveView } from "../../types/views";

export const routePaths: Record<ActiveView, string> = {
  referrals: "/indique-e-ganhe",
  dashboard: "/dashboard",
  admin: "/admin",
  debts: "/dividas",
  debtsStatement: "/extrato",
  incomes: "/receitas",
  payments: "/pagamentos",
  incomeReceipts: "/recebimentos",
  categories: "/categorias",
  creditCards: "/cartoes-de-credito",
  profile: "/perfil",
  plans: "/planos",
  forecast: "/previsao",
  calendar: "/calendario",
  reminders: "/lembretes",
  goals: "/metas",
  goalContributions: "/metas/contribuicoes",
  comparisons: "/comparativos",
  financialHealth: "/saude-financeira",
  faq: "/manual",
  support: "/suporte",
  termsOfUse: "/termos-e-privacidade",
};

export const dashboardRoutePaths = {
  list: "/dashboard",
};

export const userRoutePaths = {
  list: "/usuarios",
  create: "/usuarios/new",
  edit: (id = ":id") => `/usuarios/${id}/edit`,
  legacyList: "/users",
  legacyCreate: "/users/new",
  legacyEdit: (id = ":id") => `/users/${id}/edit`,
};

export const adminRoutePaths = {
  list: "/admin",
};

export const supportTicketRoutePaths = {
  detail: (id = ":id") => `/admin/chamados/${id}`,
};

export const debtRoutePaths = {
  list: "/dividas",
  management: "/dividas/gestao",
  create: "/dividas/new",
  edit: (id = ":id") => `/dividas/${id}/edit`,
  reports: "/dividas/relatorios",
  legacyList: "/debts",
  legacyManagement: "/debts/management",
  legacyCreate: "/debts/new",
  legacyEdit: (id = ":id") => `/debts/${id}/edit`,
  legacyReports: "/debts/reports",
};

export const debtsStatementRoutePaths = {
  list: "/extrato",
};

export const incomeRoutePaths = {
  list: "/receitas",
  create: "/receitas/new",
  edit: (id = ":id") => `/receitas/${id}/edit`,
};

export const paymentRoutePaths = {
  list: "/pagamentos",
};

export const incomeReceiptRoutePaths = {
  list: "/recebimentos",
};

export const categoryRoutePaths = {
  list: "/categorias",
  create: "/categorias/new",
  edit: (id = ":id") => `/categorias/${id}/edit`,
  legacyList: "/categories",
  legacyCreate: "/categories/new",
  legacyEdit: (id = ":id") => `/categories/${id}/edit`,
};

export const creditCardRoutePaths = {
  list: "/cartoes-de-credito",
  create: "/cartoes-de-credito/new",
  edit: (id = ":id") => `/cartoes-de-credito/${id}/edit`,
};

export const authRoutePaths = {
  login: "/",
  firstAccessChangePassword: "/primeiro-acesso/alterar-senha",
  passwordRecovery: "/recuperar-senha",
  passwordRecoveryReset: "/recuperar-senha/nova-senha",
};

export const faqRoutePaths = {
  list: "/manual",
};

export const supportRoutePaths = {
  list: "/suporte",
};

export const termsOfUseRoutePaths = {
  list: "/termos-e-privacidade",
};

export const planRoutePaths = {
  list: "/planos",
};

export const forecastRoutePaths = {
  list: "/previsao",
};

export const calendarRoutePaths = {
  list: "/calendario",
};

export const reminderRoutePaths = {
  list: "/lembretes",
};

export const comparisonRoutePaths = {
  list: "/comparativos",
};

export const financialHealthRoutePaths = {
  list: "/saude-financeira",
};

export const goalRoutePaths = {
  list: "/metas",
  create: "/metas/new",
  edit: (id = ":id") => `/metas/${id}/edit`,
};

export const goalContributionRoutePaths = {
  list: "/metas/contribuicoes",
};

export const utilityRoutePaths = {
  accessDenied: "/acesso-negado",
};

export const referralsRoutePaths = {
  list: "/indique-e-ganhe",
};
