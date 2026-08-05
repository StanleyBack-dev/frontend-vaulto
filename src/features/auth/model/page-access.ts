import type { ActiveView } from "../../../types/views";
import type { PageAccessKey, UserGroup } from "../../../api/users/schema";
import { getDefaultPagePermissionsByGroup } from "../../users/model/group-defaults";

const pageAccessByView: Partial<Record<ActiveView, PageAccessKey>> = {
  dashboard: "DASHBOARD",
  categories: "CATEGORIES",
  debts: "DEBTS",
  debtsStatement: "DEBTS_STATEMENT",
  incomes: "INCOMES",
  payments: "PAYMENTS",
  incomeReceipts: "INCOME_RECEIPTS",
  creditCards: "CREDIT_CARDS",
  users: "USERS",
};

export function getGroupDefaultPagePermissions(
  group: UserGroup,
): PageAccessKey[] {
  return getDefaultPagePermissionsByGroup(group);
}

export function hasPageAccess(
  view: ActiveView,
  pagePermissions: PageAccessKey[],
): boolean {
  if (view === "profile") {
    return true;
  }

  const requiredPermission = pageAccessByView[view];
  if (!requiredPermission) {
    return true;
  }

  return pagePermissions.includes(requiredPermission);
}

export function isRoutedView(view: ActiveView): boolean {
  return view !== "profile";
}
