const INCOME_RECEIPT_FIELDS = `
  idIncomeReceipt
  idIncome
  idIncomeInstallment
  idUsers
  amountReceived
  receivedAt
  createdAt
`;

const INCOME_INSTALLMENT_FIELDS = `
  idIncomeInstallment
  idIncome
  installmentNumber
  amountDue
  amountReceived
  dueDate
  receivedAt
  status
`;

export const REGISTER_INSTALLMENT_RECEIPT_MUTATION = `
  mutation RegisterInstallmentReceipt($input: RegisterInstallmentReceiptInputDto!) {
    registerInstallmentReceipt(input: $input) {
      data {
        idIncome
        incomeStatus
        receipts {
          ${INCOME_RECEIPT_FIELDS}
        }
        installments {
          ${INCOME_INSTALLMENT_FIELDS}
        }
      }
    }
  }
`;

export const GET_INCOME_RECEIPTS_QUERY = `
  query GetIncomeReceipts($idIncome: String!) {
    getIncomeReceipts(idIncome: $idIncome) {
      ${INCOME_RECEIPT_FIELDS}
    }
  }
`;

export const UPDATE_INCOME_RECEIPT_MUTATION = `
  mutation UpdateIncomeReceipt($input: UpdateIncomeReceiptInputDto!) {
    updateIncomeReceipt(input: $input) {
      data {
        idIncome
        incomeStatus
        receipts {
          ${INCOME_RECEIPT_FIELDS}
        }
        installments {
          ${INCOME_INSTALLMENT_FIELDS}
        }
      }
    }
  }
`;

export const DELETE_INCOME_RECEIPT_MUTATION = `
  mutation DeleteIncomeReceipt($idIncomeReceipt: String!) {
    deleteIncomeReceipt(idIncomeReceipt: $idIncomeReceipt) {
      data {
        idIncome
        incomeStatus
        receipts {
          ${INCOME_RECEIPT_FIELDS}
        }
        installments {
          ${INCOME_INSTALLMENT_FIELDS}
        }
      }
    }
  }
`;
