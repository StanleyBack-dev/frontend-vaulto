import {
  PRO_PLAN_FIRST_MONTH_PRICE,
  PRO_PLAN_PRICES,
} from "@/features/billing";

// Mirrors backend-vaulto's buildCommissionMarkdownTable (same subscriber
// tiers, same Pro plan prices) so the admin sees the exact same numbers in
// the detail modal that were computed for the e-mail itself.
const COMMISSION_TABLE_SUBSCRIBER_TIERS = [10, 25, 50, 100, 250, 500, 1000];

export interface CommissionTableRow {
  subscribers: number;
  firstMonthCommission: number;
  recurringCommission: number;
}

export function buildCommissionTable(
  partnershipPercentage: number,
): CommissionTableRow[] {
  const rate = partnershipPercentage / 100;

  return COMMISSION_TABLE_SUBSCRIBER_TIERS.map((subscribers) => ({
    subscribers,
    firstMonthCommission: subscribers * PRO_PLAN_FIRST_MONTH_PRICE * rate,
    recurringCommission: subscribers * PRO_PLAN_PRICES.MONTHLY * rate,
  }));
}
