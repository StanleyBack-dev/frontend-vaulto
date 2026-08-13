import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { AccountLifecycleResponse } from "../schema";

export async function cancelAccountDeletion(): Promise<AccountLifecycleResponse> {
  try {
    const response = await apiHttp.post<AccountLifecycleResponse>(
      "/account/deletion/cancel",
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível cancelar a exclusão da conta.",
      ),
    );
  }
}
