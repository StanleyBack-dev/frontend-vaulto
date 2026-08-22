export const MARKETING_EMAIL_DEFAULT_TEMPLATE_QUERY = `
  query MarketingEmailDefaultTemplate {
    marketingEmailDefaultTemplate {
      subject
      bodyMarkdown
    }
  }
`;

export const PREVIEW_MARKETING_EMAIL_QUERY = `
  query PreviewMarketingEmail($input: PreviewMarketingEmailInputDto!) {
    previewMarketingEmail(input: $input) {
      html
    }
  }
`;

export const MARKETING_EMAIL_RECIPIENT_COOLDOWN_QUERY = `
  query MarketingEmailRecipientCooldown($email: String!) {
    marketingEmailRecipientCooldown(email: $email) {
      blocked
      nextAllowedAt
    }
  }
`;

const MARKETING_EMAIL_SEND_FIELDS = `
  idMarketingEmailSend
  category
  recipientEmail
  recipientName
  recipientPhone
  subject
  partnershipPercentage
  sentByAdminName
  createdAt
`;

export const LIST_MARKETING_EMAIL_SENDS_QUERY = `
  query ListMarketingEmailSends($input: ListMarketingEmailSendsInputDto) {
    listMarketingEmailSends(input: $input) {
      items {
        ${MARKETING_EMAIL_SEND_FIELDS}
      }
      total
      currentPage
      limit
      totalPages
      hasNextPage
    }
  }
`;

export const EXPORT_MARKETING_EMAIL_SENDS_QUERY = `
  query ExportMarketingEmailSends($input: ListMarketingEmailSendsInputDto) {
    exportMarketingEmailSends(input: $input) {
      filename
      mimeType
      base64
    }
  }
`;

export const SEND_MARKETING_EMAIL_MUTATION = `
  mutation SendMarketingEmail($input: SendMarketingEmailInputDto!) {
    sendMarketingEmail(input: $input) {
      ${MARKETING_EMAIL_SEND_FIELDS}
    }
  }
`;
