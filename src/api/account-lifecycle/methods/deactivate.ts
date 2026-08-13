import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  AccountLifecycleResponse,
  DeactivateAccountPayload,
} from "../schema";

export async function deactivateAccount(
  payload: DeactivateAccountPayload,
): Promise<AccountLifecycleResponse> {
  try {
    const response = await apiHttp.post<AccountLifecycleResponse>(
      "/account/deactivate",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível inativar a conta."),
    );
  }
}
