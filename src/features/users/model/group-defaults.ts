import type { PageAccessKey, UserGroup } from "../../../api/users/schema";

export const defaultByGroup: Record<UserGroup, PageAccessKey[]> = {
  USER: ["DASHBOARD", "CATEGORIES", "DEBTS", "PAYMENTS", "CREDIT_CARDS"],
  ADMIN: ["DASHBOARD", "CATEGORIES", "DEBTS", "PAYMENTS", "CREDIT_CARDS"],
  ADMIN_MASTER: [
    "DASHBOARD",
    "CATEGORIES",
    "DEBTS",
    "PAYMENTS",
    "CREDIT_CARDS",
    "USERS",
  ],
};

export function getDefaultPagePermissionsByGroup(
  group: UserGroup,
): PageAccessKey[] {
  return defaultByGroup[group] ?? [];
}
