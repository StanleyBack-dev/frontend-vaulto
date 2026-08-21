import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { SendReferralInvitePayload } from "../schema";

export async function sendReferralInvite(
  payload: SendReferralInvitePayload,
): Promise<void> {
  try {
    await apiHttp.post("/referrals/invite", payload);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível enviar o convite."),
    );
  }
}
