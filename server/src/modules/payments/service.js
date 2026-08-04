import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  DELETE_DEBT_PAYMENT_MUTATION,
  GET_DEBT_PAYMENTS_QUERY,
  REGISTER_INSTALLMENT_PAYMENT_MUTATION,
  UPDATE_DEBT_PAYMENT_MUTATION,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function registerInstallmentPayment(
  input,
  authContext,
  requestId,
) {
  const data = await executeGraphql({
    query: REGISTER_INSTALLMENT_PAYMENT_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.registerInstallmentPayment?.data,
    "Invalid installment payment response.",
  );
}

export async function getDebtPayments(idDebt, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_DEBT_PAYMENTS_QUERY,
    variables: { idDebt },
    requestId,
    ...authContext,
  });

  return data.getDebtPayments || [];
}

export async function updateDebtPayment(input, authContext, requestId) {
  const data = await executeGraphql({
    query: UPDATE_DEBT_PAYMENT_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.updateDebtPayment?.data,
    "Invalid update payment response.",
  );
}

export async function deleteDebtPayment(idDebtPayment, authContext, requestId) {
  const data = await executeGraphql({
    query: DELETE_DEBT_PAYMENT_MUTATION,
    variables: { idDebtPayment },
    requestId,
    ...authContext,
  });

  return requireData(
    data.deleteDebtPayment?.data,
    "Invalid delete payment response.",
  );
}
