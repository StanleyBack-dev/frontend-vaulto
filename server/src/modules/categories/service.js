import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  CREATE_CATEGORY_MUTATION,
  GET_CATEGORY_BY_ID_QUERY,
  GET_MY_CATEGORIES_QUERY,
  UPDATE_CATEGORY_MUTATION,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function listCategories(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_MY_CATEGORIES_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(data.getMyCategories, "Invalid categories list response.");
}

export async function getCategoryById(idCategory, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_CATEGORY_BY_ID_QUERY,
    variables: { input: { idCategory } },
    requestId,
    ...authContext,
  });

  return requireData(data.getCategoryById, "Category not found.");
}

export async function createCategory(input, authContext, requestId) {
  const data = await executeGraphql({
    query: CREATE_CATEGORY_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.createCategory?.data,
    "Invalid create category response.",
  );
}

export async function updateCategory(input, authContext, requestId) {
  const data = await executeGraphql({
    query: UPDATE_CATEGORY_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.updateCategory?.data,
    "Invalid update category response.",
  );
}
