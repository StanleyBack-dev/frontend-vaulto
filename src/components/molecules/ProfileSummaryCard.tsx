import { useState } from "react";
import type { User } from "@/api/users/schema";
import type { Subscription } from "@/api/billing/schema";
import PlanBadge from "@atoms/PlanBadge";
import { colors, typography } from "../../config";
import { formatDateDisplay } from "../../utils/format";

interface ProfileSummaryCardProps {
  user: User;
  subscription?: Subscription | null;
}

export default function ProfileSummaryCard({
  user,
  subscription,
}: ProfileSummaryCardProps) {
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
      {user.urlAvatar && !avatarLoadFailed ? (
        <img
          src={user.urlAvatar}
          alt={user.name}
          className="h-20 w-20 shrink-0 rounded-full object-cover"
          onError={() => setAvatarLoadFailed(true)}
        />
      ) : (
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
          }}
        >
          {user.name.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <h2
            className="text-lg font-bold"
            style={{
              color: colors.brown[800],
              fontFamily: typography.fontFamily,
            }}
          >
            {user.name}
          </h2>
          {subscription && (
            <PlanBadge plan={subscription.plan} status={subscription.status} />
          )}
        </div>
        <p className="mt-1 text-sm" style={{ color: colors.brown[500] }}>
          {user.email}
        </p>
        <div
          className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs sm:justify-start"
          style={{ color: colors.brown[500] }}
        >
          {user.username && (
            <span>
              <strong style={{ color: colors.brown[800] }}>Usuário:</strong>{" "}
              {user.username}
            </span>
          )}
          <span>
            <strong style={{ color: colors.brown[800] }}>
              Conta criada em:
            </strong>{" "}
            {formatDateDisplay(user.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
