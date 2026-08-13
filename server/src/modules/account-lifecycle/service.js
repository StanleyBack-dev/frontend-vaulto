import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  CANCEL_ACCOUNT_DELETION_MUTATION,
  DEACTIVATE_ACCOUNT_MUTATION,
  REQUEST_ACCOUNT_DELETION_MUTATION,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function deactivateAccount(input, authContext, requestId) {
  const data = await executeGraphql({
    query: DEACTIVATE_ACCOUNT_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.deactivateAccount,
    "Invalid deactivate account response.",
  );
}

export async function requestAccountDeletion(input, authContext, requestId) {
  const data = await executeGraphql({
    query: REQUEST_ACCOUNT_DELETION_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.requestAccountDeletion,
    "Invalid request account deletion response.",
  );
}

export async function cancelAccountDeletion(authContext, requestId) {
  const data = await executeGraphql({
    query: CANCEL_ACCOUNT_DELETION_MUTATION,
    requestId,
    ...authContext,
  });

  return requireData(
    data.cancelAccountDeletion,
    "Invalid cancel account deletion response.",
  );
}
