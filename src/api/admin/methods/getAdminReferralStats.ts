import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { AdminReferralStats } from "../schema";

export async function getAdminReferralStats(): Promise<AdminReferralStats> {
  try {
    const response = await apiHttp.get<AdminReferralStats>(
      "/admin/referrals/stats",
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar as estatísticas de indicações.",
      ),
    );
  }
}
