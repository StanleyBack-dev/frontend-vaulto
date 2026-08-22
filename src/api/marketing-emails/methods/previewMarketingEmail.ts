import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  MarketingEmailPreview,
  MarketingEmailPreviewPayload,
} from "../schema";

export async function previewMarketingEmail(
  payload: MarketingEmailPreviewPayload,
): Promise<MarketingEmailPreview> {
  try {
    const response = await apiHttp.post<MarketingEmailPreview>(
      "/admin/marketing-emails/preview",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível gerar o preview do e-mail."),
    );
  }
}
