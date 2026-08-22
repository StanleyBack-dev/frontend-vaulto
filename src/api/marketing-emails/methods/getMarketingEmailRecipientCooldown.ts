import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { MarketingEmailCooldown } from "../schema";

export async function getMarketingEmailRecipientCooldown(
  email: string,
): Promise<MarketingEmailCooldown> {
  try {
    const response = await apiHttp.get<MarketingEmailCooldown>(
      "/admin/marketing-emails/cooldown",
      { params: { email } },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível verificar o histórico desse contato.",
      ),
    );
  }
}
