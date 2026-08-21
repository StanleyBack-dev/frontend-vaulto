import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { AdminReferralLeaderboardRow } from "../schema";

export async function getAdminReferralLeaderboard(): Promise<
  AdminReferralLeaderboardRow[]
> {
  try {
    const response = await apiHttp.get<AdminReferralLeaderboardRow[]>(
      "/admin/referrals/leaderboard",
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar o ranking de indicações.",
      ),
    );
  }
}
