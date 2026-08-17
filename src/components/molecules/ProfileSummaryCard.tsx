import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import type { User } from "@/api/users/schema";
import type { Subscription } from "@/api/billing/schema";
import { updateMyProfile } from "@/features/users/services/user.service";
import PlanBadge from "@atoms/PlanBadge";
import { colors, typography } from "../../config";
import { formatDateDisplay } from "../../utils/format";
import { useToast } from "../../shared/toast/useToast";

interface ProfileSummaryCardProps {
  user: User;
  subscription?: Subscription | null;
  onNameUpdated?: (name: string) => void;
}

export default function ProfileSummaryCard({
  user,
  subscription,
  onNameUpdated,
}: ProfileSummaryCardProps) {
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const { showError, showSuccess } = useToast();

  function startEditingName() {
    setNameDraft(user.name);
    setIsEditingName(true);
  }

  function cancelEditingName() {
    setIsEditingName(false);
    setNameDraft(user.name);
  }

  async function saveName() {
    const trimmed = nameDraft.trim();

    if (!trimmed) {
      showError("Nome inválido", "O nome não pode ficar em branco.");
      return;
    }

    if (trimmed === user.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);

    try {
      const result = await updateMyProfile(trimmed);
      onNameUpdated?.(result.name);
      setIsEditingName(false);
      showSuccess("Nome atualizado", "Seu nome foi atualizado com sucesso.");
    } catch (error) {
      showError(
        "Não foi possível atualizar",
        error instanceof Error
          ? error.message
          : "Tente novamente em instantes.",
      );
    } finally {
      setIsSavingName(false);
    }
  }

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
          {isEditingName ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={nameDraft}
                disabled={isSavingName}
                onChange={(event) => setNameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void saveName();
                  if (event.key === "Escape") cancelEditingName();
                }}
                className="rounded-lg border px-2 py-1 text-lg font-bold outline-none"
                style={{
                  color: colors.brown[800],
                  fontFamily: typography.fontFamily,
                  borderColor: colors.brown[100],
                }}
              />
              <button
                type="button"
                aria-label="Salvar nome"
                disabled={isSavingName}
                onClick={() => void saveName()}
                className="rounded-full p-1.5 text-white disabled:opacity-60"
                style={{ background: colors.purple[700] }}
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                aria-label="Cancelar edição"
                disabled={isSavingName}
                onClick={cancelEditingName}
                className="rounded-full p-1.5 disabled:opacity-60"
                style={{
                  background: "#f3f4f6",
                  color: colors.brown[500],
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <h2
                className="text-lg font-bold"
                style={{
                  color: colors.brown[800],
                  fontFamily: typography.fontFamily,
                }}
              >
                {user.name}
              </h2>
              <button
                type="button"
                aria-label="Editar nome"
                onClick={startEditingName}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <Pencil size={14} />
              </button>
            </>
          )}
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
