import type { MarketingEmailCategory } from "../../../api/marketing-emails/schema";

export const MARKETING_EMAIL_CATEGORY_OPTIONS: Array<{
  value: MarketingEmailCategory;
  label: string;
}> = [
  { value: "INFLUENCER", label: "Influenciador / Criador de Conteúdo" },
  { value: "BUSINESS_PARTNER", label: "Parceiro Comercial" },
  { value: "PRESS", label: "Imprensa / Mídia" },
  { value: "OTHER", label: "Outro" },
];

export const MARKETING_EMAIL_CATEGORY_LABELS: Record<string, string> =
  Object.fromEntries(
    MARKETING_EMAIL_CATEGORY_OPTIONS.map((option) => [
      option.value,
      option.label,
    ]),
  );
