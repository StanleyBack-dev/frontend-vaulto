import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  MY_SUPPORT_MESSAGE_STATUS_QUERY,
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
