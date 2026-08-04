import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import { GET_DEBTS_REPORT_QUERY } from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function getDebtsReport(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_DEBTS_REPORT_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(data.getDebtsReport, "Invalid debts report response.");
}
