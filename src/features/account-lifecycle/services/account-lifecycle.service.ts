import { cancelAccountDeletion as cancelAccountDeletionRequest } from "@/api/account-lifecycle/methods/cancel-deletion";
import { deactivateAccount as deactivateAccountRequest } from "@/api/account-lifecycle/methods/deactivate";
import { requestAccountDeletion as requestAccountDeletionRequest } from "@/api/account-lifecycle/methods/request-deletion";
import type {
  AccountLifecycleResponse,
  DeactivateAccountPayload,
  RequestAccountDeletionPayload,
} from "@/api/account-lifecycle/schema";

export async function requestDeactivateAccount(
  payload: DeactivateAccountPayload,
): Promise<AccountLifecycleResponse> {
  return deactivateAccountRequest(payload);
}

export async function requestAccountDeletion(
  payload: RequestAccountDeletionPayload,
): Promise<AccountLifecycleResponse> {
  return requestAccountDeletionRequest(payload);
}

export async function requestCancelAccountDeletion(): Promise<AccountLifecycleResponse> {
  return cancelAccountDeletionRequest();
}
