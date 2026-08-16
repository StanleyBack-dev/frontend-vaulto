import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import { EXPORT_RESOURCE_QUERY } from "./queries.js";

export async function exportResource(input, authContext, requestId) {
  const data = await executeGraphql({
    query: EXPORT_RESOURCE_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  if (!data.exportResource) {
    throw new HttpError(502, "Invalid export response.");
  }

  return data.exportResource;
}
