import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  DELETE_INCOME_RECEIPT_MUTATION,
  GET_INCOME_RECEIPTS_QUERY,
  REGISTER_INSTALLMENT_RECEIPT_MUTATION,
  UPDATE_INCOME_RECEIPT_MUTATION,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function registerInstallmentReceipt(
  input,
  authContext,
  requestId,
) {
  const data = await executeGraphql({
    query: REGISTER_INSTALLMENT_RECEIPT_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.registerInstallmentReceipt?.data,
    "Invalid installment receipt response.",
  );
}

export async function getIncomeReceipts(idIncome, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_INCOME_RECEIPTS_QUERY,
    variables: { idIncome },
    requestId,
    ...authContext,
  });

  return data.getIncomeReceipts || [];
}

export async function updateIncomeReceipt(input, authContext, requestId) {
  const data = await executeGraphql({
    query: UPDATE_INCOME_RECEIPT_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.updateIncomeReceipt?.data,
    "Invalid update receipt response.",
  );
}

export async function deleteIncomeReceipt(
  idIncomeReceipt,
  authContext,
  requestId,
) {
  const data = await executeGraphql({
    query: DELETE_INCOME_RECEIPT_MUTATION,
    variables: { idIncomeReceipt },
    requestId,
    ...authContext,
  });

  return requireData(
    data.deleteIncomeReceipt?.data,
    "Invalid delete receipt response.",
  );
}
