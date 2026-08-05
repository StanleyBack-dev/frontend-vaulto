import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  CREATE_DEBT_MUTATION,
  DELETE_DEBT_MUTATION,
  GET_DEBT_BY_ID_QUERY,
  GET_MY_DEBTS_QUERY,
  UPDATE_DEBT_DETAILS_MUTATION,
  UPDATE_DEBT_STATUS_MUTATION,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function listDebts(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_MY_DEBTS_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(data.getMyDebts, "Invalid debts list response.");
}

export async function getDebtById(idDebt, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_DEBT_BY_ID_QUERY,
    variables: { input: { idDebt } },
    requestId,
    ...authContext,
  });

  return requireData(data.getDebtById, "Debt not found.");
}

export async function createDebt(input, authContext, requestId) {
  const data = await executeGraphql({
    query: CREATE_DEBT_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(data.createDebt?.data, "Invalid create debt response.");
}

export async function updateDebtStatus(input, authContext, requestId) {
  const data = await executeGraphql({
    query: UPDATE_DEBT_STATUS_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.updateDebtStatus?.data,
    "Invalid debt status response.",
  );
}

export async function updateDebtDetails(input, authContext, requestId) {
  const data = await executeGraphql({
    query: UPDATE_DEBT_DETAILS_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.updateDebtDetails?.data,
    "Invalid debt details response.",
  );
}

export async function deleteDebt(idDebt, authContext, requestId) {
  const data = await executeGraphql({
    query: DELETE_DEBT_MUTATION,
    variables: { idDebt },
    requestId,
    ...authContext,
  });

  return requireData(data.deleteDebt, "Invalid delete debt response.");
}
