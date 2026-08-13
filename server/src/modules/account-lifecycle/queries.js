const BASE_RESPONSE_FIELDS = `
  success
  message
  code
`;

export const DEACTIVATE_ACCOUNT_MUTATION = `
  mutation DeactivateAccount($input: DeactivateAccountInputDto!) {
    deactivateAccount(input: $input) {
      ${BASE_RESPONSE_FIELDS}
    }
  }
`;

export const REQUEST_ACCOUNT_DELETION_MUTATION = `
  mutation RequestAccountDeletion($input: RequestAccountDeletionInputDto!) {
    requestAccountDeletion(input: $input) {
      ${BASE_RESPONSE_FIELDS}
    }
  }
`;

export const CANCEL_ACCOUNT_DELETION_MUTATION = `
  mutation CancelAccountDeletion {
    cancelAccountDeletion {
      ${BASE_RESPONSE_FIELDS}
    }
  }
`;
