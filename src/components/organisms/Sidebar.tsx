import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { brand, colors, typography } from "../../config";
import { ChevronRight, LogOut } from "lucide-react";
import type { ActiveView } from "../../types/views";
import { logoutCurrentSession, useAuthSession } from "../../features/auth";
import { authRoutePaths } from "../../router";
import {
  primaryNavigationItems,
  secondaryNavigationItems,
} from "../../router/navigation";
import ConfirmDialog from "@molecules/ConfirmDialog";
import { useToast } from "../../shared/toast/useToast";
import { AuthApiError } from "../../api/auth/methods/http-error";

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
  const { hasPageAccess, clearSession } = useAuthSession();
  const { showSuccess, showError } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const visiblePrimaryItems = primaryNavigationItems.filter((item) =>
    hasPageAccess(item.id),
  );

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
          className="flex items-center justify-between border-b px-5 py-6 lg:px-6 lg:py-8"
          style={{ borderColor: colors.brown[100] }}
        >
          <div className="flex items-center gap-3">
            <img
              src="/vaulto-logo-96.png"
              alt={brand.name}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <h1
                className="text-sm font-bold leading-tight tracking-wide text-white"
                style={{ fontFamily: typography.fontFamily }}
              >
                {brand.name}
              </h1>
              <p
                className="text-xs tracking-widest"
                style={{
                  color: colors.gold[500],
                  fontFamily: typography.fontFamily,
                }}
              >
                {brand.subtitle.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs font-semibold text-[#c5bbeb] lg:hidden"
          >
            Fechar
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 lg:py-6">
          <p
            className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest"
            style={{
              color: colors.brown[500],
              fontFamily: typography.fontFamily,
            }}
          >
            Menu Principal
          </p>
          {visiblePrimaryItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose?.();
                }}
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
                <span className={isActive ? "text-white" : ""}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="text-white opacity-70" />
                )}
              </button>
            );
          })}
        </nav>

        <div
          className="space-y-1 border-t px-3 pb-6 pt-4"
          style={{ borderColor: colors.brown[100] }}
        >
          <p
            className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: colors.brown[500] }}
          >
            Conta
          </p>
          {secondaryNavigationItems.map((item) => {
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
