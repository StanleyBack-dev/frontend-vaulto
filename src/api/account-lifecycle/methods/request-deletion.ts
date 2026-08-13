import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  AccountLifecycleResponse,
  RequestAccountDeletionPayload,
} from "../schema";

export async function requestAccountDeletion(
  payload: RequestAccountDeletionPayload,
): Promise<AccountLifecycleResponse> {
  try {
    const response = await apiHttp.post<AccountLifecycleResponse>(
      "/account/deletion",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível solicitar a exclusão da conta.",
      ),
    );
  }
}
