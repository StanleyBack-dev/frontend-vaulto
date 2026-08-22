import { exportMarketingEmailSends } from "../../../api/marketing-emails/methods/exportMarketingEmailSends";
import { getMarketingEmailDefaultTemplate } from "../../../api/marketing-emails/methods/getMarketingEmailDefaultTemplate";
import { getMarketingEmailRecipientCooldown } from "../../../api/marketing-emails/methods/getMarketingEmailRecipientCooldown";
import { listMarketingEmailSends } from "../../../api/marketing-emails/methods/listMarketingEmailSends";
import { previewMarketingEmail } from "../../../api/marketing-emails/methods/previewMarketingEmail";
import { sendMarketingEmail } from "../../../api/marketing-emails/methods/sendMarketingEmail";
import {
  ListMarketingEmailSendsQueryParamsSchema,
  MarketingEmailCooldownSchema,
  MarketingEmailDefaultTemplateSchema,
  MarketingEmailExportSchema,
  MarketingEmailPreviewSchema,
  MarketingEmailSendSchema,
  MarketingEmailSendsResponseSchema,
  type ListMarketingEmailSendsQueryParams,
  type MarketingEmailCooldown,
  type MarketingEmailDefaultTemplate,
  type MarketingEmailExport,
  type MarketingEmailPreview,
  type MarketingEmailPreviewPayload,
  type MarketingEmailSend,
  type MarketingEmailSendsResponse,
  type SendMarketingEmailPayload,
} from "../../../api/marketing-emails/schema";

export async function fetchMarketingEmailDefaultTemplate(): Promise<MarketingEmailDefaultTemplate> {
  const response = await getMarketingEmailDefaultTemplate();
  const parsed = MarketingEmailDefaultTemplateSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o texto padrão do e-mail.");
  }

  return parsed.data;
}

export async function requestMarketingEmailPreview(
  payload: MarketingEmailPreviewPayload,
): Promise<MarketingEmailPreview> {
  const response = await previewMarketingEmail(payload);
  const parsed = MarketingEmailPreviewSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o preview do e-mail.");
  }

  return parsed.data;
}

export async function fetchMarketingEmailRecipientCooldown(
  email: string,
): Promise<MarketingEmailCooldown> {
  const response = await getMarketingEmailRecipientCooldown(email);
  const parsed = MarketingEmailCooldownSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o status do contato.");
  }

  return parsed.data;
}

export async function fetchMarketingEmailSends(
  params: ListMarketingEmailSendsQueryParams = {},
): Promise<MarketingEmailSendsResponse> {
  const parsedParams = ListMarketingEmailSendsQueryParamsSchema.parse(params);
  const response = await listMarketingEmailSends(parsedParams);
  const parsed = MarketingEmailSendsResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o histórico de e-mails.");
  }

  return parsed.data;
}

export async function requestMarketingEmailSendsExport(
  params: Pick<ListMarketingEmailSendsQueryParams, "category" | "recipientEmail"> = {},
): Promise<MarketingEmailExport> {
  const response = await exportMarketingEmailSends(params);
  const parsed = MarketingEmailExportSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o arquivo exportado.");
  }

  return parsed.data;
}

export async function requestSendMarketingEmail(
  payload: SendMarketingEmailPayload,
): Promise<MarketingEmailSend> {
  const response = await sendMarketingEmail(payload);
  const parsed = MarketingEmailSendSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar a confirmação de envio.");
  }

  return parsed.data;
}
