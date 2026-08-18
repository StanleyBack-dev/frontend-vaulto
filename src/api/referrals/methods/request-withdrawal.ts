import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  ReferralWithdrawal,
  RequestReferralWithdrawalPayload,
} from "../schema";

export async function requestReferralWithdrawal(
  payload: RequestReferralWithdrawalPayload,
): Promise<ReferralWithdrawal> {
  try {
    const response = await apiHttp.post<ReferralWithdrawal>(
      "/referrals/withdrawals",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível solicitar o saque."),
    );
  }
}
