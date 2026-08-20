import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { ReferredUser } from "../schema";

export async function getMyReferrals(): Promise<ReferredUser[]> {
  try {
    const response = await apiHttp.get<ReferredUser[]>("/referrals");
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar seus amigos indicados.",
      ),
    );
  }
}
