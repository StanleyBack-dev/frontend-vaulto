import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  CREATE_CREDIT_CARD_MUTATION,
  GET_CREDIT_CARD_BY_ID_QUERY,
  GET_MY_CREDIT_CARDS_QUERY,
  UPDATE_CREDIT_CARD_MUTATION,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function listCreditCards(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_MY_CREDIT_CARDS_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.getMyCreditCards,
    "Invalid credit cards list response.",
  );
}

export async function getCreditCardById(idCreditCard, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_CREDIT_CARD_BY_ID_QUERY,
    variables: { input: { idCreditCard } },
    requestId,
    ...authContext,
  });

  return requireData(data.getCreditCardById, "Credit card not found.");
}

export async function createCreditCard(input, authContext, requestId) {
  const data = await executeGraphql({
    query: CREATE_CREDIT_CARD_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.createCreditCard?.data,
    "Invalid create credit card response.",
  );
}

export async function updateCreditCard(input, authContext, requestId) {
  const data = await executeGraphql({
    query: UPDATE_CREDIT_CARD_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.updateCreditCard?.data,
    "Invalid update credit card response.",
  );
}
