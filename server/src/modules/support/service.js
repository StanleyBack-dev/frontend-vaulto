import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  FINALIZE_SUPPORT_TICKET_MUTATION,
  GET_SUPPORT_TICKET_QUERY,
  LIST_SUPPORT_TICKETS_QUERY,
  MY_SUPPORT_MESSAGE_STATUS_QUERY,
  REPLY_TO_SUPPORT_TICKET_MUTATION,
  SEND_SUPPORT_MESSAGE_MUTATION,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function sendSupportMessage(input, authContext, requestId) {
  const data = await executeGraphql({
    query: SEND_SUPPORT_MESSAGE_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.sendSupportMessage,
    "Invalid send support message response.",
  );
}

export async function getMySupportMessageStatus(authContext, requestId) {
  const data = await executeGraphql({
    query: MY_SUPPORT_MESSAGE_STATUS_QUERY,
    requestId,
    ...authContext,
  });

  return requireData(
    data.mySupportMessageStatus,
    "Invalid support message status response.",
  );
}

export async function listSupportTickets(input, authContext, requestId) {
  const data = await executeGraphql({
    query: LIST_SUPPORT_TICKETS_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.listSupportTickets,
    "Invalid list support tickets response.",
  );
}

export async function getSupportTicket(
  idSupportMessage,
  authContext,
  requestId,
) {
  const data = await executeGraphql({
    query: GET_SUPPORT_TICKET_QUERY,
    variables: { idSupportMessage },
    requestId,
    ...authContext,
  });

  return requireData(
    data.getSupportTicket,
    "Invalid get support ticket response.",
  );
}

export async function replyToSupportTicket(input, authContext, requestId) {
  const data = await executeGraphql({
    query: REPLY_TO_SUPPORT_TICKET_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.replyToSupportTicket,
    "Invalid reply to support ticket response.",
  );
}

export async function finalizeSupportTicket(
  idSupportMessage,
  authContext,
  requestId,
) {
  const data = await executeGraphql({
    query: FINALIZE_SUPPORT_TICKET_MUTATION,
    variables: { idSupportMessage },
    requestId,
    ...authContext,
  });

  return requireData(
    data.finalizeSupportTicket,
    "Invalid finalize support ticket response.",
  );
}
