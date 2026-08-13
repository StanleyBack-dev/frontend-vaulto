export const SEND_SUPPORT_MESSAGE_MUTATION = `
  mutation SendSupportMessage($input: SendSupportMessageInputDto!) {
    sendSupportMessage(input: $input) {
      category
      message
      createdAt
    }
  }
`;

export const MY_SUPPORT_MESSAGE_STATUS_QUERY = `
  query MySupportMessageStatus {
    mySupportMessageStatus {
      canSend
      nextAllowedAt
    }
  }
`;
