import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  ListMarketingEmailSendsQueryParams,
  MarketingEmailExport,
} from "../schema";

export async function exportMarketingEmailSends(
  params: Pick<
    ListMarketingEmailSendsQueryParams,
    "category" | "recipientEmail"
  > = {},
): Promise<MarketingEmailExport> {
  try {
    const response = await apiHttp.get<MarketingEmailExport>(
      "/admin/marketing-emails/sends/export",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível exportar o histórico de e-mails.",
      ),
    );
  }
}
