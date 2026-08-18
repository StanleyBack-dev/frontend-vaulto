import { z } from "zod";
import { PixKeyTypeSchema, type PixKeyType } from "@/api/referrals/schema";
import {
  formatCNPJ,
  formatCPF,
  formatPhone,
  formatPixEvpKey,
  onlyDigits,
  sanitizeEmailInput,
} from "@/utils/format";
import {
  isValidCNPJ,
  isValidCPF,
  isValidPixEvpKey,
  isValidPixMobilePhone,
} from "@/utils/validators";

export const pixWithdrawalFormSchema = z
  .object({
    pixKeyType: PixKeyTypeSchema,
    pixKey: z.string().min(1, "Informe sua chave Pix."),
  })
  .superRefine((values, ctx) => {
    const { pixKeyType, pixKey } = values;

    switch (pixKeyType) {
      case "CPF":
        if (!isValidCPF(pixKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["pixKey"],
            message: "Informe um CPF válido.",
          });
        }
        break;
      case "CNPJ":
        if (!isValidCNPJ(pixKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["pixKey"],
            message: "Informe um CNPJ válido.",
          });
        }
        break;
      case "PHONE":
        if (!isValidPixMobilePhone(pixKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["pixKey"],
            message: "Informe um celular válido, com DDD.",
          });
        }
        break;
      case "EMAIL":
        if (!z.string().email().safeParse(pixKey).success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["pixKey"],
            message: "Informe um e-mail válido.",
          });
        }
        break;
      case "EVP":
        if (!isValidPixEvpKey(pixKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["pixKey"],
            message: "Chave aleatória inválida.",
          });
        }
        break;
    }
  });

export type PixWithdrawalFormValues = z.infer<typeof pixWithdrawalFormSchema>;

export const emptyPixWithdrawalFormValues: PixWithdrawalFormValues = {
  pixKeyType: "EMAIL",
  pixKey: "",
};

export function maskPixKeyInput(
  pixKeyType: PixKeyType,
  rawValue: string,
): string {
  switch (pixKeyType) {
    case "CPF":
      return formatCPF(rawValue);
    case "CNPJ":
      return formatCNPJ(rawValue);
    case "PHONE":
      return formatPhone(rawValue);
    case "EVP":
      return formatPixEvpKey(rawValue);
    case "EMAIL":
      return sanitizeEmailInput(rawValue);
  }
}

// Converts the masked display value into the shape the gateway expects on
// submit (e.g. CPF/CNPJ digits-only, phone in E.164 with the +55 prefix).
export function toSubmittablePixKey(
  pixKeyType: PixKeyType,
  maskedValue: string,
): string {
  switch (pixKeyType) {
    case "CPF":
    case "CNPJ":
      return onlyDigits(maskedValue);
    case "PHONE":
      return `+55${onlyDigits(maskedValue)}`;
    case "EVP":
    case "EMAIL":
      return maskedValue.trim().toLowerCase();
  }
}
