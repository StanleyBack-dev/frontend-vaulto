import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { ReferralStats } from "../schema";

export async function getMyReferralStats(): Promise<ReferralStats> {
  try {
    const response = await apiHttp.get<ReferralStats>("/referrals/stats");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar seus dados de indicação.",
      ),
    );
  }
}
