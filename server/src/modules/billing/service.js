import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import { MY_SUBSCRIPTION_QUERY, SUBSCRIBE_TO_PRO_MUTATION } from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function getMySubscription(authContext, requestId) {
  const data = await executeGraphql({
    query: MY_SUBSCRIPTION_QUERY,
    requestId,
    ...authContext,
  });

  return requireData(data.mySubscription, "Invalid subscription response.");
}

export async function subscribeToPro(input, authContext, requestId) {
  const data = await executeGraphql({
    query: SUBSCRIBE_TO_PRO_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(data.subscribeToPro, "Invalid subscribe response.");
}
