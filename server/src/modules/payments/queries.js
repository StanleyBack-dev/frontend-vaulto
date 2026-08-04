const DEBT_PAYMENT_FIELDS = `
  idDebtPayment
  idDebt
  idDebtInstallment
  idUsers
  amountPaid
  paidAt
  createdAt
`;

const DEBT_INSTALLMENT_FIELDS = `
  idDebtInstallment
  idDebt
  installmentNumber
  amountDue
  amountPaid
  dueDate
  paidAt
  status
`;

export const REGISTER_INSTALLMENT_PAYMENT_MUTATION = `
  mutation RegisterInstallmentPayment($input: RegisterInstallmentPaymentInputDto!) {
    registerInstallmentPayment(input: $input) {
      data {
        idDebt
        debtStatus
        payments {
          ${DEBT_PAYMENT_FIELDS}
        }
        installments {
          ${DEBT_INSTALLMENT_FIELDS}
        }
      }
    }
  }
`;

export const GET_DEBT_PAYMENTS_QUERY = `
  query GetDebtPayments($idDebt: String!) {
    getDebtPayments(idDebt: $idDebt) {
      ${DEBT_PAYMENT_FIELDS}
    }
  }
`;

export const UPDATE_DEBT_PAYMENT_MUTATION = `
  mutation UpdateDebtPayment($input: UpdateDebtPaymentInputDto!) {
    updateDebtPayment(input: $input) {
      data {
        idDebt
        debtStatus
        payments {
          ${DEBT_PAYMENT_FIELDS}
        }
        installments {
          ${DEBT_INSTALLMENT_FIELDS}
        }
      }
    }
  }
`;

export const DELETE_DEBT_PAYMENT_MUTATION = `
  mutation DeleteDebtPayment($idDebtPayment: String!) {
    deleteDebtPayment(idDebtPayment: $idDebtPayment) {
      data {
        idDebt
        debtStatus
        payments {
          ${DEBT_PAYMENT_FIELDS}
        }
        installments {
          ${DEBT_INSTALLMENT_FIELDS}
        }
      }
    }
  }
`;
