import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { brand, colors, typography } from "../../config";
import { ChevronDown, ChevronRight, Crown, Gift, LogOut } from "lucide-react";
import type { ActiveView } from "../../types/views";
import { logoutCurrentSession, useAuthSession } from "../../features/auth";
import { useBillingContext } from "../../features/billing";
import {
  fetchMyReferralStats,
  subscribeReferralBalanceEvents,
} from "../../features/referrals";
import { authRoutePaths } from "../../router";
import { formatCurrencyFromCents } from "../../utils/format";
import {
  isNavigationGroup,
  primaryNavigationLayout,
  secondaryNavigationItems,
  type NavigationItem,
} from "../../router/navigation";
import ConfirmDialog from "@molecules/ConfirmDialog";
import { useToast } from "../../shared/toast/useToast";
import { AuthApiError } from "../../api/auth/methods/http-error";

interface NavItemButtonProps {
  item: NavigationItem;
  isActive: boolean;
  isPro: boolean;
  onSelect: () => void;
}

function NavItemButton({
  item,
  isActive,
  isPro,
  onSelect,
}: NavItemButtonProps) {
  return (
    <button
      type="button"
      data-tour-nav={item.id}
      onClick={onSelect}
      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
        isActive ? "text-white" : "text-brown-300 hover:text-white"
      }`}
      style={
        isActive
          ? {
              background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
              color: "#fff",
            }
          : { color: colors.brown[300] }
      }
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background =
            colors.black[700];
          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
          (e.currentTarget as HTMLButtonElement).style.color =
            colors.brown[300];
        }
      }}
    >
      <span className={isActive ? "text-white" : ""}>{item.icon}</span>
      <span className="flex-1 text-left">{item.label}</span>
      {item.proOnly && !isPro && (
        <Crown
          size={14}
          className="shrink-0"
          style={{ color: isActive ? "#fff" : colors.gold[500] }}
        />
      )}
      {isActive && <ChevronRight size={14} className="text-white opacity-70" />}
    </button>
  );
}

interface SidebarProps {
  active: ActiveView;
  onNavigate: (view: ActiveView) => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  active,
  onNavigate,
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const { session, hasPageAccess, clearSession } = useAuthSession();
  const { isPro } = useBillingContext();
  const { showSuccess, showError } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isAccountSectionOpen, setIsAccountSectionOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [referralBalanceCents, setReferralBalanceCents] = useState<
    number | null
  >(null);
  const [openGroupIds, setOpenGroupIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [session?.user?.urlAvatar]);

  useEffect(() => {
    if (!session?.user?.idUsers) {
      setReferralBalanceCents(null);
      return;
    }

    let cancelled = false;

    // Silent by design — this is a decorative shortcut, not a data view of
    // its own, so a failed fetch just hides the balance row instead of
    // showing an error toast.
    fetchMyReferralStats()
      .then((stats) => {
        if (!cancelled) setReferralBalanceCents(stats.availableBalanceCents);
      })
      .catch(() => {
        if (!cancelled) setReferralBalanceCents(null);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.idUsers]);

  useEffect(() => {
    return subscribeReferralBalanceEvents((availableBalanceCents) => {
      setReferralBalanceCents(availableBalanceCents);
    });
  }, []);

  const visiblePrimaryLayout = primaryNavigationLayout
    .map((entry) => {
      if (isNavigationGroup(entry)) {
        const visibleItems = entry.items.filter((item) =>
          hasPageAccess(item.id),
        );
        return visibleItems.length > 0
          ? { ...entry, items: visibleItems }
          : null;
      }

      return hasPageAccess(entry.id) ? entry : null;
    })
    .filter((entry) => entry !== null);
  const visibleSecondaryItems = secondaryNavigationItems.filter((item) =>
    hasPageAccess(item.id),
  );

  function toggleGroup(id: string) {
    setOpenGroupIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logoutCurrentSession();
      showSuccess("Sessão encerrada", "Logout realizado com sucesso.");
    } catch (error) {
      const message =
        error instanceof AuthApiError || error instanceof Error
          ? error.message
          : "Não foi possível encerrar a sessão no servidor.";

      showError("Logout parcial", message);
    } finally {
      clearSession();
      setIsLoggingOut(false);
      setIsLogoutDialogOpen(false);
      onClose?.();
      navigate(authRoutePaths.login, { replace: true });
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#06050d]/60 transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!mobileOpen}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col transition-transform duration-300 lg:w-64 lg:max-w-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: colors.brown[800] }}
      >
        <div
          className="border-b px-5 py-6 lg:px-6 lg:py-8"
          style={{ borderColor: colors.brown[100] }}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onNavigate("profile");
                onClose?.();
              }}
              className="flex min-w-0 items-center gap-3 text-left"
              aria-label="Ir para o perfil"
            >
              {session?.user?.urlAvatar && !avatarLoadFailed ? (
                <img
                  src={session.user.urlAvatar}
                  alt={session.user.name || brand.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
                  }}
                >
                  {session?.user?.name?.slice(0, 2).toUpperCase() ||
                    brand.initials}
                </div>
              )}
              <div className="min-w-0">
                <h1
                  className="text-sm font-bold leading-tight tracking-wide text-white"
                  style={{ fontFamily: typography.fontFamily }}
                >
                  {brand.name}
                </h1>
                <p
                  className="truncate text-xs tracking-widest"
                  style={{
                    color: colors.gold[500],
                    fontFamily: typography.fontFamily,
                  }}
                >
                  {session?.user?.name || brand.subtitle.toUpperCase()}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-xs font-semibold text-[#c5bbeb] lg:hidden"
            >
              Fechar
            </button>
          </div>

          {referralBalanceCents !== null && (
            <button
              type="button"
              onClick={() => {
                onNavigate("referrals");
                onClose?.();
              }}
              className="mt-3 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors hover:bg-white/5"
              aria-label="Ver saldo de indicações"
            >
              <Gift size={16} style={{ color: colors.gold[500] }} />
              <span style={{ color: "#c5bbeb" }}>
                {formatCurrencyFromCents(referralBalanceCents)}
              </span>
            </button>
          )}
        </div>

        <nav className="sidebar-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5 lg:py-6">
          {visiblePrimaryLayout.map((entry) => {
            if (isNavigationGroup(entry)) {
              const hasActiveChild = entry.items.some(
                (item) => item.id === active,
              );
              const isOpen = openGroupIds.has(entry.id) || hasActiveChild;
              const isGroupProOnly = entry.items.every((item) => item.proOnly);

              return (
                <div key={entry.id}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(entry.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200"
                    style={{
                      color: hasActiveChild ? "#fff" : colors.brown[300],
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        colors.black[700];
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        hasActiveChild ? "#fff" : colors.brown[300];
                    }}
                  >
                    <span>{entry.icon}</span>
                    <span className="flex-1 text-left">{entry.label}</span>
                    {isGroupProOnly && !isPro && (
                      <Crown
                        size={14}
                        className="shrink-0"
                        style={{
                          color: hasActiveChild ? "#fff" : colors.gold[500],
                        }}
                      />
                    )}
                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition-transform duration-200 ${
                        isOpen ? "" : "-rotate-90"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className="ml-3 space-y-1 border-l pl-3"
                      style={{ borderColor: colors.brown[100] }}
                    >
                      {entry.items.map((item) => (
                        <NavItemButton
                          key={item.id}
                          item={item}
                          isActive={active === item.id}
                          isPro={isPro}
                          onSelect={() => {
                            onNavigate(item.id);
                            onClose?.();
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavItemButton
                key={entry.id}
                item={entry}
                isActive={active === entry.id}
                isPro={isPro}
                onSelect={() => {
                  onNavigate(entry.id);
                  onClose?.();
                }}
              />
            );
          })}
        </nav>

        <div
          className="shrink-0 space-y-1 border-t px-3 pb-6 pt-4"
          style={{ borderColor: colors.brown[100] }}
        >
          <button
            type="button"
            onClick={() => setIsAccountSectionOpen((open) => !open)}
            className="mb-1 flex w-full items-center justify-between px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ color: colors.brown[500] }}
            aria-expanded={isAccountSectionOpen}
          >
            <span>Conta</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                isAccountSectionOpen ? "" : "-rotate-90"
              }`}
            />
          </button>
          {isAccountSectionOpen &&
            visibleSecondaryItems.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose?.();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${colors.purple[700]}, ${colors.gold[500]})`,
                          color: "#fff",
                        }
                      : { color: colors.brown[300] }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        colors.black[700];
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        colors.brown[300];
                    }
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          <button
            type="button"
            onClick={() => setIsLogoutDialogOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200"
            style={{ color: "#f4a8b8" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                colors.black[700];
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        title="Encerrar sessão"
        description="Você perderá a sessão atual e precisará fazer login novamente para continuar. Deseja mesmo sair?"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        variant="danger"
        icon={<LogOut size={20} />}
        loading={isLoggingOut}
        onConfirm={() => {
          void handleLogout();
        }}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </>
  );
}
