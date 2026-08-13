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

const SUPPORT_TICKET_FIELDS = `
  idSupportMessage
  protocolNumber
  userName
  userEmail
  category
  message
  status
  adminReply
  repliedAt
  finalizedAt
  finalizedByName
  createdAt
`;

export const LIST_SUPPORT_TICKETS_QUERY = `
  query ListSupportTickets($input: ListSupportTicketsInputDto) {
    listSupportTickets(input: $input) {
      items {
        ${SUPPORT_TICKET_FIELDS}
      }
      total
      currentPage
      limit
      totalPages
      hasNextPage
    }
  }
`;

export const GET_SUPPORT_TICKET_QUERY = `
  query GetSupportTicket($idSupportMessage: String!) {
    getSupportTicket(idSupportMessage: $idSupportMessage) {
      ${SUPPORT_TICKET_FIELDS}
    }
  }
`;

export const REPLY_TO_SUPPORT_TICKET_MUTATION = `
  mutation ReplyToSupportTicket($input: ReplyToSupportTicketInputDto!) {
    replyToSupportTicket(input: $input) {
      ${SUPPORT_TICKET_FIELDS}
    }
  }
`;

export const FINALIZE_SUPPORT_TICKET_MUTATION = `
  mutation FinalizeSupportTicket($idSupportMessage: String!) {
    finalizeSupportTicket(idSupportMessage: $idSupportMessage) {
      ${SUPPORT_TICKET_FIELDS}
    }
  }
`;
