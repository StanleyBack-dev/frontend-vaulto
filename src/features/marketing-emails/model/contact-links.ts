// Builds the clickable destinations for the history table / detail modal —
// e-mail opens the OS mail client, phone opens a WhatsApp chat (matching the
// wa.me link already used in the default outreach template's own contact
// section), and the social link gets a protocol if the admin typed it bare.
export function buildMailtoLink(email: string): string {
  return `mailto:${email}`;
}

export function buildWhatsAppLink(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}`;
}

export function normalizeExternalLink(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
