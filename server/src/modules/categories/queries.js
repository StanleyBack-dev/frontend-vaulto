const CATEGORY_FIELDS = `
  idCategory
  idUsers
  name
  status
  inactivatedAt
  createdAt
  updatedAt
`;

export const GET_MY_CATEGORIES_QUERY = `
  query GetMyCategories($input: ListCategoriesInputDto) {
    getMyCategories(input: $input) {
      items {
        ${CATEGORY_FIELDS}
      }
      total
      currentPage
      limit
      totalPages
      hasNextPage
    }
  }
`;

export const GET_CATEGORY_BY_ID_QUERY = `
  query GetCategoryById($input: GetCategoryByIdInputDto!) {
    getCategoryById(input: $input) {
      ${CATEGORY_FIELDS}
    }
  }
`;

export const CREATE_CATEGORY_MUTATION = `
  mutation CreateCategory($input: CreateCategoryInputDto!) {
    createCategory(input: $input) {
      data {
        ${CATEGORY_FIELDS}
      }
    }
  }
`;

export const UPDATE_CATEGORY_MUTATION = `
  mutation UpdateCategory($input: UpdateCategoryInputDto!) {
    updateCategory(input: $input) {
      data {
        ${CATEGORY_FIELDS}
      }
    }
  }
`;
