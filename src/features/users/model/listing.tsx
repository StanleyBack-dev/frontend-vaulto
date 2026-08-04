import type { DataTableColumn } from "../../../components/organisms/DataTable";
import EditIcon from "../../../components/atoms/icons/EditIcon";
import type { User } from "../../../api/users/schema";
import { formatDateTimeDisplay } from "../../../utils/format";
import { userUiCopy } from "./messages";

function getGroupLabel(group: User["group"]) {
  if (group === "ADMIN") {
    return userUiCopy.form.options.groupAdmin;
  }

  if (group === "ADMIN_MASTER") {
    return userUiCopy.form.options.groupAdminMaster;
  }

  return userUiCopy.form.options.groupUser;
}

function getStatusPillStyle(status: boolean) {
  return status
    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
    : "bg-rose-100 text-rose-800 border border-rose-300";
}

export function getUserTableColumns(actions: {
  onEdit: (user: User) => void;
}): DataTableColumn<User>[] {
  return [
    {
      key: "actions",
      label: userUiCopy.listing.columns.actions,
      render: (user) => (
        <button
          type="button"
          title={userUiCopy.listing.actions.edit}
          className="text-violet-700 transition hover:text-violet-900"
          onClick={(event) => {
            event.stopPropagation();
            actions.onEdit(user);
          }}
        >
          <EditIcon size={18} />
        </button>
      ),
    },
    {
      key: "name",
      label: userUiCopy.listing.columns.name,
      render: (user) => (
        <span className="text-sm font-semibold text-[#1a1333]">
          {user.name}
        </span>
      ),
    },
    {
      key: "email",
      label: userUiCopy.listing.columns.email,
      render: (user) => (
        <span className="text-sm text-[#5a4e7a]">{user.email}</span>
      ),
    },
    {
      key: "username",
      label: userUiCopy.listing.columns.username,
      render: (user) => (
        <span className="text-sm text-[#5a4e7a]">{user.username}</span>
      ),
    },
    {
      key: "group",
      label: userUiCopy.listing.columns.group,
      render: (user) => (
        <span className="text-sm text-[#2d2060]">
          {getGroupLabel(user.group)}
        </span>
      ),
    },
    {
      key: "status",
      label: userUiCopy.listing.columns.status,
      render: (user) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusPillStyle(user.status)}`}
        >
          {user.status
            ? userUiCopy.listing.values.active
            : userUiCopy.listing.values.inactive}
        </span>
      ),
    },
    {
      key: "mustChangePassword",
      label: userUiCopy.listing.columns.mustChangePassword,
      render: (user) => (
        <span className="text-sm text-[#4a3f6b]">
          {user.mustChangePassword
            ? userUiCopy.listing.values.active
            : userUiCopy.listing.values.inactive}
        </span>
      ),
    },
    {
      key: "lastLoginAt",
      label: userUiCopy.listing.columns.lastLoginAt,
      render: (user) => (
        <span className="text-sm text-[#4a3f6b]">
          {formatDateTimeDisplay(user.lastLoginAt ?? undefined) || "-"}
        </span>
      ),
    },
    {
      key: "failedLoginAttempts",
      label: userUiCopy.listing.columns.failedLoginAttempts,
      render: (user) => (
        <span className="text-sm text-[#4a3f6b]">
          {user.failedLoginAttempts ?? 0}
        </span>
      ),
    },
    {
      key: "lockedUntil",
      label: userUiCopy.listing.columns.lockedUntil,
      render: (user) => (
        <span className="text-sm text-[#4a3f6b]">
          {formatDateTimeDisplay(user.lockedUntil ?? undefined) || "-"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: userUiCopy.listing.columns.createdAt,
      render: (user) => (
        <span className="text-sm text-[#4a3f6b]">
          {formatDateTimeDisplay(user.createdAt)}
        </span>
      ),
    },
  ];
}
