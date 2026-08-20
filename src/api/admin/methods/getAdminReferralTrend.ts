import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  AdminReferralMonthlyPoint,
  AdminReferralTrendQueryParams,
} from "../schema";

export async function getAdminReferralTrend(
  params: AdminReferralTrendQueryParams,
): Promise<AdminReferralMonthlyPoint[]> {
  try {
    const response = await apiHttp.get<AdminReferralMonthlyPoint[]>(
      "/admin/referrals/trend",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar a evolução das indicações.",
      ),
    );
  }
}
