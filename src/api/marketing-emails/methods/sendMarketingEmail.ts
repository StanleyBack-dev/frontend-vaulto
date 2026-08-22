import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { MarketingEmailSend, SendMarketingEmailPayload } from "../schema";

export async function sendMarketingEmail(
  payload: SendMarketingEmailPayload,
): Promise<MarketingEmailSend> {
  try {
    const response = await apiHttp.post<MarketingEmailSend>(
      "/admin/marketing-emails",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível enviar o e-mail."),
    );
  }
}
