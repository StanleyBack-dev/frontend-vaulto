import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  CREATE_INCOME_MUTATION,
  DELETE_INCOME_MUTATION,
  GET_INCOME_BY_ID_QUERY,
  GET_MY_INCOMES_QUERY,
  UPDATE_INCOME_DETAILS_MUTATION,
  UPDATE_INCOME_STATUS_MUTATION,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function listIncomes(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_MY_INCOMES_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(data.getMyIncomes, "Invalid incomes list response.");
}

export async function getIncomeById(idIncome, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_INCOME_BY_ID_QUERY,
    variables: { input: { idIncome } },
    requestId,
    ...authContext,
  });

  return requireData(data.getIncomeById, "Income not found.");
}

export async function createIncome(input, authContext, requestId) {
  const data = await executeGraphql({
    query: CREATE_INCOME_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.createIncome?.data,
    "Invalid create income response.",
  );
}

export async function updateIncomeDetails(input, authContext, requestId) {
  const data = await executeGraphql({
    query: UPDATE_INCOME_DETAILS_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.updateIncomeDetails?.data,
    "Invalid income details response.",
  );
}

export async function updateIncomeStatus(input, authContext, requestId) {
  const data = await executeGraphql({
    query: UPDATE_INCOME_STATUS_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.updateIncomeStatus?.data,
    "Invalid income status response.",
  );
}

export async function deleteIncome(idIncome, authContext, requestId) {
  const data = await executeGraphql({
    query: DELETE_INCOME_MUTATION,
    variables: { idIncome },
    requestId,
    ...authContext,
  });

  return requireData(data.deleteIncome, "Invalid delete income response.");
}
