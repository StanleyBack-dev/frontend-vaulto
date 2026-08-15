import type { ActiveView } from "../../types/views";
import {
  adminRoutePaths,
  calendarRoutePaths,
  categoryRoutePaths,
  comparisonRoutePaths,
  creditCardRoutePaths,
  dashboardRoutePaths,
  debtRoutePaths,
  debtsStatementRoutePaths,
  faqRoutePaths,
  financialHealthRoutePaths,
  forecastRoutePaths,
  goalContributionRoutePaths,
  goalRoutePaths,
  incomeReceiptRoutePaths,
  incomeRoutePaths,
  paymentRoutePaths,
  planRoutePaths,
  referralsRoutePaths,
  reminderRoutePaths,
  routePaths,
  settingsRoutePaths,
  supportRoutePaths,
  termsOfUseRoutePaths,
  userRoutePaths,
} from "./paths";

export function getActiveView(pathname: string): ActiveView {
  if (pathname.startsWith(dashboardRoutePaths.list)) {
    return "dashboard";
  }

  if (
    pathname.startsWith(adminRoutePaths.list) ||
    pathname.startsWith(userRoutePaths.list) ||
    pathname.startsWith(userRoutePaths.legacyList)
  ) {
    return "admin";
  }

  if (
    pathname.startsWith(debtRoutePaths.list) ||
    pathname.startsWith(debtRoutePaths.legacyList)
  ) {
    return "debts";
  }

  if (pathname.startsWith(debtsStatementRoutePaths.list)) {
    return "debtsStatement";
  }

  if (pathname.startsWith(incomeRoutePaths.list)) {
    return "incomes";
  }

  if (pathname.startsWith(paymentRoutePaths.list)) {
    return "payments";
  }

  if (pathname.startsWith(incomeReceiptRoutePaths.list)) {
    return "incomeReceipts";
  }

  if (
    pathname.startsWith(categoryRoutePaths.list) ||
    pathname.startsWith(categoryRoutePaths.legacyList)
  ) {
    return "categories";
  }

  if (pathname.startsWith(creditCardRoutePaths.list)) {
    return "creditCards";
  }

  if (pathname.startsWith(routePaths.profile)) {
    return "profile";
  }

  if (pathname.startsWith(settingsRoutePaths.list)) {
    return "settings";
  }

  if (pathname.startsWith(planRoutePaths.list)) {
    return "plans";
  }

  if (pathname.startsWith(referralsRoutePaths.list)) {
    return "referrals";
  }

  if (pathname.startsWith(forecastRoutePaths.list)) {
    return "forecast";
  }

  if (pathname.startsWith(calendarRoutePaths.list)) {
    return "calendar";
  }

  if (pathname.startsWith(reminderRoutePaths.list)) {
    return "reminders";
  }

  if (pathname.startsWith(goalContributionRoutePaths.list)) {
    return "goalContributions";
  }

  if (pathname.startsWith(goalRoutePaths.list)) {
    return "goals";
  }

  if (pathname.startsWith(comparisonRoutePaths.list)) {
    return "comparisons";
  }

  if (pathname.startsWith(financialHealthRoutePaths.list)) {
    return "financialHealth";
  }

  if (pathname.startsWith(faqRoutePaths.list)) {
    return "faq";
  }

  if (pathname.startsWith(supportRoutePaths.list)) {
    return "support";
  }

  if (pathname.startsWith(termsOfUseRoutePaths.list)) {
    return "termsOfUse";
  }

  return "dashboard";
}

export function getPathForView(view: ActiveView) {
  switch (view) {
    case "dashboard":
      return dashboardRoutePaths.list;
    case "categories":
      return categoryRoutePaths.list;
    case "creditCards":
      return creditCardRoutePaths.list;
    case "admin":
      return adminRoutePaths.list;
    case "profile":
      return routePaths.profile;
    case "settings":
      return settingsRoutePaths.list;
    case "plans":
      return planRoutePaths.list;
    case "referrals":
      return referralsRoutePaths.list;
    case "forecast":
      return forecastRoutePaths.list;
    case "calendar":
      return calendarRoutePaths.list;
    case "reminders":
      return reminderRoutePaths.list;
    case "goals":
      return goalRoutePaths.list;
    case "goalContributions":
      return goalContributionRoutePaths.list;
    case "comparisons":
      return comparisonRoutePaths.list;
    case "financialHealth":
      return financialHealthRoutePaths.list;
    case "faq":
      return faqRoutePaths.list;
    case "support":
      return supportRoutePaths.list;
    case "termsOfUse":
      return termsOfUseRoutePaths.list;
    case "payments":
      return paymentRoutePaths.list;
    case "incomeReceipts":
      return incomeReceiptRoutePaths.list;
    case "debtsStatement":
      return debtsStatementRoutePaths.list;
    case "incomes":
      return incomeRoutePaths.list;
    case "debts":
    default:
      return debtRoutePaths.list;
  }
}
