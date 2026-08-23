import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  MarketingEmailSend,
  UpdateMarketingEmailSendContactPayload,
} from "../schema";

export async function updateMarketingEmailSendContact(
  payload: UpdateMarketingEmailSendContactPayload,
): Promise<MarketingEmailSend> {
  try {
    const { idMarketingEmailSend, ...body } = payload;
    const response = await apiHttp.patch<MarketingEmailSend>(
      `/admin/marketing-emails/${idMarketingEmailSend}/contact`,
      body,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível atualizar as informações de contato.",
      ),
    );
  }
}
