const FINANCIAL_GOAL_FIELDS = `
  idFinancialGoal
  idUsers
  title
  description
  targetAmount
  currentAmount
  targetDate
  status
  progressPercent
  estimatedMonthsToComplete
  contributions {
    idGoalContribution
    idFinancialGoal
    amount
    contributedAt
    note
    createdAt
  }
  createdAt
  updatedAt
`;

export const GET_MY_FINANCIAL_GOALS_QUERY = `
  query GetMyFinancialGoals($input: ListFinancialGoalsInputDto) {
    getMyFinancialGoals(input: $input) {
      items {
        ${FINANCIAL_GOAL_FIELDS}
      }
      total
      currentPage
      limit
      totalPages
      hasNextPage
    }
  }
`;

export const GET_FINANCIAL_GOAL_BY_ID_QUERY = `
  query GetFinancialGoalById($input: GetFinancialGoalByIdInputDto!) {
    getFinancialGoalById(input: $input) {
      ${FINANCIAL_GOAL_FIELDS}
    }
  }
`;

export const CREATE_FINANCIAL_GOAL_MUTATION = `
  mutation CreateFinancialGoal($input: CreateFinancialGoalInputDto!) {
    createFinancialGoal(input: $input) {
      data {
        ${FINANCIAL_GOAL_FIELDS}
      }
    }
  }
`;

export const UPDATE_FINANCIAL_GOAL_MUTATION = `
  mutation UpdateFinancialGoal($input: UpdateFinancialGoalInputDto!) {
    updateFinancialGoal(input: $input) {
      data {
        ${FINANCIAL_GOAL_FIELDS}
      }
    }
  }
`;

export const DELETE_FINANCIAL_GOAL_MUTATION = `
  mutation DeleteFinancialGoal($idFinancialGoal: String!) {
    deleteFinancialGoal(idFinancialGoal: $idFinancialGoal) {
      success
      message
      code
    }
  }
`;

export const REGISTER_GOAL_CONTRIBUTION_MUTATION = `
  mutation RegisterGoalContribution($input: RegisterGoalContributionInputDto!) {
    registerGoalContribution(input: $input) {
      data {
        ${FINANCIAL_GOAL_FIELDS}
      }
    }
  }
`;

export const UPDATE_GOAL_CONTRIBUTION_MUTATION = `
  mutation UpdateGoalContribution($input: UpdateGoalContributionInputDto!) {
    updateGoalContribution(input: $input) {
      data {
        ${FINANCIAL_GOAL_FIELDS}
      }
    }
  }
`;

export const DELETE_GOAL_CONTRIBUTION_MUTATION = `
  mutation DeleteGoalContribution(
    $idFinancialGoal: String!
    $idGoalContribution: String!
  ) {
    deleteGoalContribution(
      idFinancialGoal: $idFinancialGoal
      idGoalContribution: $idGoalContribution
    ) {
      data {
        ${FINANCIAL_GOAL_FIELDS}
      }
    }
  }
`;
