const INCOME_FIELDS = `
  idIncome
  idCategory
  category
  title
  description
  incomeType
  expectedAmount
  expectedDate
  receivedAmount
  receivedAt
  isRecurring
  status
  createdAt
  updatedAt
`;

export const GET_MY_INCOMES_QUERY = `
  query GetMyIncomes($input: ListIncomesInputDto) {
    getMyIncomes(input: $input) {
      items {
        ${INCOME_FIELDS}
      }
      total
      currentPage
      limit
      totalPages
      hasNextPage
    }
  }
`;

export const GET_INCOME_BY_ID_QUERY = `
  query GetIncomeById($input: GetIncomeByIdInputDto!) {
    getIncomeById(input: $input) {
      ${INCOME_FIELDS}
    }
  }
`;

export const CREATE_INCOME_MUTATION = `
  mutation CreateIncome($input: CreateIncomeInputDto!) {
    createIncome(input: $input) {
      data {
        ${INCOME_FIELDS}
      }
    }
  }
`;

export const UPDATE_INCOME_DETAILS_MUTATION = `
  mutation UpdateIncomeDetails($input: UpdateIncomeDetailsInputDto!) {
    updateIncomeDetails(input: $input) {
      data {
        ${INCOME_FIELDS}
      }
    }
  }
`;

export const UPDATE_INCOME_STATUS_MUTATION = `
  mutation UpdateIncomeStatus($input: UpdateIncomeStatusInputDto!) {
    updateIncomeStatus(input: $input) {
      data {
        ${INCOME_FIELDS}
      }
    }
  }
`;

export const DELETE_INCOME_MUTATION = `
  mutation DeleteIncome($idIncome: String!) {
    deleteIncome(idIncome: $idIncome) {
      success
      message
      code
    }
  }
`;
