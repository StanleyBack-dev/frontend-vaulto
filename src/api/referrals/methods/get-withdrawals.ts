import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { ReferralWithdrawal } from "../schema";

export async function getMyReferralWithdrawals(): Promise<
  ReferralWithdrawal[]
> {
  try {
    const response = await apiHttp.get<ReferralWithdrawal[]>(
      "/referrals/withdrawals",
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar seu histórico de saques.",
      ),
    );
  }
}
