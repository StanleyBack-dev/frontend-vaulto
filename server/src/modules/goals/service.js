import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  CREATE_FINANCIAL_GOAL_MUTATION,
  DELETE_FINANCIAL_GOAL_MUTATION,
  DELETE_GOAL_CONTRIBUTION_MUTATION,
  GET_FINANCIAL_GOAL_BY_ID_QUERY,
  GET_MY_FINANCIAL_GOALS_QUERY,
  REGISTER_GOAL_CONTRIBUTION_MUTATION,
  UPDATE_FINANCIAL_GOAL_MUTATION,
  UPDATE_GOAL_CONTRIBUTION_MUTATION,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function listFinancialGoals(input, authContext, requestId) {
  const data = await executeGraphql({
    query: GET_MY_FINANCIAL_GOALS_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.getMyFinancialGoals,
    "Invalid financial goals list response.",
  );
}

export async function getFinancialGoalById(
  idFinancialGoal,
  authContext,
  requestId,
) {
  const data = await executeGraphql({
    query: GET_FINANCIAL_GOAL_BY_ID_QUERY,
    variables: { input: { idFinancialGoal } },
    requestId,
    ...authContext,
  });

  return requireData(data.getFinancialGoalById, "Financial goal not found.");
}

export async function createFinancialGoal(input, authContext, requestId) {
  const data = await executeGraphql({
    query: CREATE_FINANCIAL_GOAL_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.createFinancialGoal?.data,
    "Invalid create financial goal response.",
  );
}

export async function updateFinancialGoal(input, authContext, requestId) {
  const data = await executeGraphql({
    query: UPDATE_FINANCIAL_GOAL_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.updateFinancialGoal?.data,
    "Invalid update financial goal response.",
  );
}

export async function deleteFinancialGoal(
  idFinancialGoal,
  authContext,
  requestId,
) {
  const data = await executeGraphql({
    query: DELETE_FINANCIAL_GOAL_MUTATION,
    variables: { idFinancialGoal },
    requestId,
    ...authContext,
  });

  return requireData(
    data.deleteFinancialGoal,
    "Invalid delete financial goal response.",
  );
}

export async function registerGoalContribution(input, authContext, requestId) {
  const data = await executeGraphql({
    query: REGISTER_GOAL_CONTRIBUTION_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.registerGoalContribution?.data,
    "Invalid register goal contribution response.",
  );
}

export async function updateGoalContribution(input, authContext, requestId) {
  const data = await executeGraphql({
    query: UPDATE_GOAL_CONTRIBUTION_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.updateGoalContribution?.data,
    "Invalid update goal contribution response.",
  );
}

export async function deleteGoalContribution(
  idFinancialGoal,
  idGoalContribution,
  authContext,
  requestId,
) {
  const data = await executeGraphql({
    query: DELETE_GOAL_CONTRIBUTION_MUTATION,
    variables: { idFinancialGoal, idGoalContribution },
    requestId,
    ...authContext,
  });

  return requireData(
    data.deleteGoalContribution?.data,
    "Invalid delete goal contribution response.",
  );
}
