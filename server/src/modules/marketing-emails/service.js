import { HttpError } from "../../shared/http/http-error.js";
import { executeGraphql } from "../../shared/http/graphql-client.js";
import {
  EXPORT_MARKETING_EMAIL_SENDS_QUERY,
  LIST_MARKETING_EMAIL_SENDS_QUERY,
  MARKETING_EMAIL_DEFAULT_TEMPLATE_QUERY,
  MARKETING_EMAIL_RECIPIENT_COOLDOWN_QUERY,
  PREVIEW_MARKETING_EMAIL_QUERY,
  SEND_MARKETING_EMAIL_MUTATION,
} from "./queries.js";

function requireData(value, message) {
  if (!value) {
    throw new HttpError(502, message);
  }

  return value;
}

export async function getMarketingEmailDefaultTemplate(authContext, requestId) {
  const data = await executeGraphql({
    query: MARKETING_EMAIL_DEFAULT_TEMPLATE_QUERY,
    requestId,
    ...authContext,
  });

  return requireData(
    data.marketingEmailDefaultTemplate,
    "Invalid marketing email default template response.",
  );
}

export async function previewMarketingEmail(input, authContext, requestId) {
  const data = await executeGraphql({
    query: PREVIEW_MARKETING_EMAIL_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.previewMarketingEmail,
    "Invalid marketing email preview response.",
  );
}

export async function getMarketingEmailRecipientCooldown(
  email,
  authContext,
  requestId,
) {
  const data = await executeGraphql({
    query: MARKETING_EMAIL_RECIPIENT_COOLDOWN_QUERY,
    variables: { email },
    requestId,
    ...authContext,
  });

  return requireData(
    data.marketingEmailRecipientCooldown,
    "Invalid marketing email cooldown response.",
  );
}

export async function listMarketingEmailSends(input, authContext, requestId) {
  const data = await executeGraphql({
    query: LIST_MARKETING_EMAIL_SENDS_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.listMarketingEmailSends,
    "Invalid list marketing email sends response.",
  );
}

export async function exportMarketingEmailSends(input, authContext, requestId) {
  const data = await executeGraphql({
    query: EXPORT_MARKETING_EMAIL_SENDS_QUERY,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.exportMarketingEmailSends,
    "Invalid export marketing email sends response.",
  );
}

export async function sendMarketingEmail(input, authContext, requestId) {
  const data = await executeGraphql({
    query: SEND_MARKETING_EMAIL_MUTATION,
    variables: { input },
    requestId,
    ...authContext,
  });

  return requireData(
    data.sendMarketingEmail,
    "Invalid send marketing email response.",
  );
}
