const DEBTS_REPORT_FIELDS = `
  totalAmountDue
  totalAmountPaid
  totalOutstanding
  totalCount
  countByStatus {
    open
    overdue
    partiallyPaid
    paid
  }
`;

export const GET_DEBTS_REPORT_QUERY = `
  query GetDebtsReport($input: GetDebtsReportInputDto) {
    getDebtsReport(input: $input) {
      ${DEBTS_REPORT_FIELDS}
    }
  }
`;

const INCOMES_REPORT_FIELDS = `
  totalAmountDue
  totalAmountReceived
  totalOutstanding
  totalCount
  countByStatus {
    pending
    overdue
    partiallyReceived
    received
  }
`;

export const GET_INCOMES_REPORT_QUERY = `
  query GetIncomesReport($input: GetIncomesReportInputDto) {
    getIncomesReport(input: $input) {
      ${INCOMES_REPORT_FIELDS}
    }
  }
`;

const CATEGORY_AMOUNT_ROW_FIELDS = `
  idCategory
  categoryName
  amount
`;

export const GET_DEBTS_AMOUNT_BY_CATEGORY_QUERY = `
  query GetDebtsAmountByCategory($input: GetCategoryAmountInputDto!) {
    getDebtsAmountByCategory(input: $input) {
      ${CATEGORY_AMOUNT_ROW_FIELDS}
    }
  }
`;

export const GET_INCOMES_AMOUNT_BY_CATEGORY_QUERY = `
  query GetIncomesAmountByCategory($input: GetCategoryAmountInputDto!) {
    getIncomesAmountByCategory(input: $input) {
      ${CATEGORY_AMOUNT_ROW_FIELDS}
    }
  }
`;

const MONTHLY_CASHFLOW_POINT_FIELDS = `
  month
  expenses
  income
  balance
`;

export const GET_MONTHLY_CASHFLOW_TREND_QUERY = `
  query GetMonthlyCashflowTrend($input: GetCategoryAmountInputDto!) {
    getMonthlyCashflowTrend(input: $input) {
      ${MONTHLY_CASHFLOW_POINT_FIELDS}
    }
  }
`;

export const GET_FINANCIAL_FORECAST_QUERY = `
  query GetFinancialForecast($input: GetFinancialForecastInputDto!) {
    getFinancialForecast(input: $input) {
      currentBalance
      projectedIncome
      projectedExpenses
      safeToSpend
      periodStart
      periodEnd
    }
  }
`;

const CATEGORY_COMPARISON_GROUP_FIELDS = `
  currentTotal
  previousTotal
  changeAmount
  changePercent
  categories {
    idCategory
    categoryName
    currentAmount
    previousAmount
    changeAmount
    changePercent
  }
`;

export const GET_CATEGORY_COMPARISON_QUERY = `
  query GetCategoryComparison($input: GetCategoryComparisonInputDto) {
    getCategoryComparison(input: $input) {
      currentPeriodStart
      currentPeriodEnd
      previousPeriodStart
      previousPeriodEnd
      expenses {
        ${CATEGORY_COMPARISON_GROUP_FIELDS}
      }
      income {
        ${CATEGORY_COMPARISON_GROUP_FIELDS}
      }
    }
  }
`;

const FINANCIAL_HEALTH_PILLAR_FIELDS = `
  score
  weight
`;

export const GET_FINANCIAL_HEALTH_SCORE_QUERY = `
  query GetFinancialHealthScore($input: GetFinancialHealthScoreInputDto) {
    getFinancialHealthScore(input: $input) {
      score
      status
      debtCommitment {
        ${FINANCIAL_HEALTH_PILLAR_FIELDS}
      }
      punctuality {
        ${FINANCIAL_HEALTH_PILLAR_FIELDS}
      }
      reserves {
        ${FINANCIAL_HEALTH_PILLAR_FIELDS}
      }
      periodStart
      periodEnd
    }
  }
`;
