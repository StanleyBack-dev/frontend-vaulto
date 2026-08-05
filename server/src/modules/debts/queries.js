const DEBT_FIELDS = `
  idDebt
  idCategory
  title
  category
  idCreditCard
  creditCard
  description
  debtType
  totalAmount
  dueDate
  acquiredAt
  endDate
  hasInstallments
  installmentCount
  status
  createdAt
  updatedAt
  installments {
    idDebtInstallment
    idDebt
    installmentNumber
    amountDue
    amountPaid
    dueDate
    paidAt
    status
  }
  payments {
    idDebtPayment
    idDebt
    idDebtInstallment
    idUsers
    amountPaid
    paidAt
    createdAt
  }
`;

export const GET_MY_DEBTS_QUERY = `
  query GetMyDebts($input: ListDebtsInputDto) {
    getMyDebts(input: $input) {
      items {
        ${DEBT_FIELDS}
      }
      total
      currentPage
      limit
      totalPages
      hasNextPage
    }
  }
`;

export const GET_DEBT_BY_ID_QUERY = `
  query GetDebtById($input: GetDebtByIdInputDto!) {
    getDebtById(input: $input) {
      ${DEBT_FIELDS}
    }
  }
`;

export const CREATE_DEBT_MUTATION = `
  mutation CreateDebt($input: CreateDebtInputDto!) {
    createDebt(input: $input) {
      data {
        ${DEBT_FIELDS}
      }
    }
  }
`;

export const UPDATE_DEBT_STATUS_MUTATION = `
  mutation UpdateDebtStatus($input: UpdateDebtStatusInputDto!) {
    updateDebtStatus(input: $input) {
      data {
        ${DEBT_FIELDS}
      }
    }
  }
`;

export const UPDATE_DEBT_DETAILS_MUTATION = `
  mutation UpdateDebtDetails($input: UpdateDebtDetailsInputDto!) {
    updateDebtDetails(input: $input) {
      data {
        ${DEBT_FIELDS}
      }
    }
  }
`;

export const DELETE_DEBT_MUTATION = `
  mutation DeleteDebt($idDebt: String!) {
    deleteDebt(idDebt: $idDebt) {
      success
      message
      code
    }
  }
`;
