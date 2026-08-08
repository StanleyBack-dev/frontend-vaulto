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
