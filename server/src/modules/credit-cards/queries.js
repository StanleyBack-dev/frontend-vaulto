const CREDIT_CARD_FIELDS = `
  idCreditCard
  idUsers
  name
  creditLimit
  dueDay
  closingDay
  status
  usedLimit
  availableLimit
  inactivatedAt
  createdAt
  updatedAt
`;

export const GET_MY_CREDIT_CARDS_QUERY = `
  query GetMyCreditCards($input: ListCreditCardsInputDto) {
    getMyCreditCards(input: $input) {
      items {
        ${CREDIT_CARD_FIELDS}
      }
      total
      currentPage
      limit
      totalPages
      hasNextPage
    }
  }
`;

export const GET_MY_CREDIT_CARD_OPTIONS_QUERY = `
  query GetMyCreditCardOptions($input: ListCreditCardsInputDto) {
    getMyCreditCardOptions(input: $input) {
      items {
        ${CREDIT_CARD_FIELDS}
      }
      total
      currentPage
      limit
      totalPages
      hasNextPage
    }
  }
`;

export const GET_CREDIT_CARD_BY_ID_QUERY = `
  query GetCreditCardById($input: GetCreditCardByIdInputDto!) {
    getCreditCardById(input: $input) {
      ${CREDIT_CARD_FIELDS}
    }
  }
`;

export const CREATE_CREDIT_CARD_MUTATION = `
  mutation CreateCreditCard($input: CreateCreditCardInputDto!) {
    createCreditCard(input: $input) {
      data {
        ${CREDIT_CARD_FIELDS}
      }
    }
  }
`;

export const UPDATE_CREDIT_CARD_MUTATION = `
  mutation UpdateCreditCard($input: UpdateCreditCardInputDto!) {
    updateCreditCard(input: $input) {
      data {
        ${CREDIT_CARD_FIELDS}
      }
    }
  }
`;
