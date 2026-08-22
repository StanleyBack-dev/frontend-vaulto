import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  ListMarketingEmailSendsQueryParams,
  MarketingEmailSendsResponse,
} from "../schema";

export async function listMarketingEmailSends(
  params: ListMarketingEmailSendsQueryParams = {},
): Promise<MarketingEmailSendsResponse> {
  try {
    const response = await apiHttp.get<MarketingEmailSendsResponse>(
      "/admin/marketing-emails/sends",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar o histórico de e-mails.",
      ),
    );
  }
}
