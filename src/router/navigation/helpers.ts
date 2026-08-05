import type { ActiveView } from "../../types/views";
import {
  categoryRoutePaths,
  creditCardRoutePaths,
  dashboardRoutePaths,
  debtRoutePaths,
  debtsStatementRoutePaths,
  incomeReceiptRoutePaths,
  incomeRoutePaths,
  paymentRoutePaths,
  routePaths,
  userRoutePaths,
} from "./paths";

export function getActiveView(pathname: string): ActiveView {
  if (pathname.startsWith(dashboardRoutePaths.list)) {
    return "dashboard";
  }

  if (
    pathname.startsWith(userRoutePaths.list) ||
    pathname.startsWith(userRoutePaths.legacyList)
  ) {
    return "users";
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
    case "users":
      return userRoutePaths.list;
    case "profile":
      return routePaths.profile;
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
