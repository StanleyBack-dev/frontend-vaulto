const SUBSCRIPTION_FIELDS = `
  plan
  status
  trialEndsAt
  currentPeriodEnd
  billingCycle
  cancelAtPeriodEnd
`;

export const MY_SUBSCRIPTION_QUERY = `
  query MySubscription {
    mySubscription {
      ${SUBSCRIPTION_FIELDS}
    }
  }
`;

export const SUBSCRIBE_TO_PRO_MUTATION = `
  mutation SubscribeToPro($input: SubscribeToProInputDto!) {
    subscribeToPro(input: $input) {
      subscription {
        ${SUBSCRIPTION_FIELDS}
      }
      checkoutUrl
      pixQrCodePayload
      pixQrCodeImage
    }
  }
`;

export const CANCEL_SUBSCRIPTION_MUTATION = `
  mutation CancelSubscription($input: CancelSubscriptionInputDto!) {
    cancelSubscription(input: $input) {
      ${SUBSCRIPTION_FIELDS}
    }
  }
`;

export const MY_BILLING_PAYMENTS_QUERY = `
  query MyBillingPayments($input: ListBillingPaymentsInputDto) {
    myBillingPayments(input: $input) {
      items {
        amount
        status
        dueDate
        paidAt
        createdAt
      }
      total
      currentPage
      limit
      totalPages
      hasNextPage
    }
  }
`;
