import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { MarketingEmailDefaultTemplate } from "../schema";

export async function getMarketingEmailDefaultTemplate(): Promise<MarketingEmailDefaultTemplate> {
  try {
    const response = await apiHttp.get<MarketingEmailDefaultTemplate>(
      "/admin/marketing-emails/default-template",
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar o texto padrão do e-mail.",
      ),
    );
  }
}
