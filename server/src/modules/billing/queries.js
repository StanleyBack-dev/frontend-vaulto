const SUBSCRIPTION_FIELDS = `
  plan
  status
  trialEndsAt
  currentPeriodEnd
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
    }
  }
`;
