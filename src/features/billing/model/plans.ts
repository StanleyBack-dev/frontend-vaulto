export const PRO_PLAN_PRICES = {
  MONTHLY: 29.9,
  YEARLY: 299.9,
} as const;

export const PRO_PLAN_FIRST_MONTH_PRICE = 19.9;

export const FREE_PLAN_LIMITS = {
  DEBTS: 5,
  CREDIT_CARDS: 1,
  INCOMES: 10,
} as const;

export function buildPlanLimitMessage(
  resourceLabel: string,
  limit: number,
): string {
  return `Limite do plano Free atingido (${limit}) para ${resourceLabel}. Assine o Vaulto Pro para continuar sem limites.`;
}

export const PRO_PLAN_MONTHLY_EQUIVALENT_WHEN_YEARLY = 24.99;

export interface PlanFeatureRow {
  label: string;
  free: string;
  pro: string;
}

export const PLAN_FEATURE_ROWS: PlanFeatureRow[] = [
  { label: "Dívidas", free: "até 5", pro: "ilimitado" },
  { label: "Cartões de crédito", free: "1", pro: "ilimitado" },
  { label: "Receitas", free: "até 10/mês", pro: "ilimitado" },
  { label: "Categorias", free: "básicas", pro: "personalizadas + ilimitadas" },
  {
    label: "Extratos / histórico",
    free: "últimos 3 meses",
    pro: "histórico completo",
  },
  { label: "Filtros", free: "básicos", pro: "avançados" },
  { label: "Relatórios", free: "básicos", pro: "avançados + comparativos" },
  { label: "Exportação (PDF/Excel)", free: "—", pro: "✓" },
  { label: "Lembretes", free: "—", pro: "✓" },
  { label: "Calendário financeiro", free: "—", pro: "✓" },
  { label: "Previsão financeira", free: "—", pro: "✓" },
  { label: "Metas financeiras", free: "—", pro: "✓" },
];

export const PAYMENT_METHODS_DESCRIPTION =
  "No checkout você escolhe entre Cartão de Crédito (renovação automática), Pix ou Boleto (pagamento manual a cada vencimento).";
