import type { CreditCard } from "@/api/credit-cards/schema";
import { formatCurrencyForInput } from "@/utils/format";

export interface CreditCardFormValues {
  name: string;
  creditLimit: string;
  dueDay: string;
  closingDay: string;
  status: boolean;
}

export const emptyCreditCardFormValues: CreditCardFormValues = {
  name: "",
  creditLimit: "",
  dueDay: "",
  closingDay: "",
  status: true,
};

export function mapCreditCardToFormValues(
  creditCard: CreditCard,
): CreditCardFormValues {
  return {
    name: creditCard.name,
    creditLimit: formatCurrencyForInput(creditCard.creditLimit),
    dueDay: String(creditCard.dueDay),
    closingDay: String(creditCard.closingDay),
    status: creditCard.status,
  };
}

export function parseCurrencyValue(value: string): number {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
