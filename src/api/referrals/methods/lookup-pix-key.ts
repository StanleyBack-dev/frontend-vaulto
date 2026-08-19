import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { PixKeyLookup, RequestReferralWithdrawalPayload } from "../schema";

export async function lookupReferralWithdrawalPixKey(
  payload: RequestReferralWithdrawalPayload,
): Promise<PixKeyLookup> {
  try {
    const response = await apiHttp.post<PixKeyLookup>(
      "/referrals/withdrawals/lookup-pix-key",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível verificar essa chave Pix."),
    );
  }
}
