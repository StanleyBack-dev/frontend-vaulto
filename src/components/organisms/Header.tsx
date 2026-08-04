import SearchIcon from "../atoms/icons/SearchIcon";
import BellIcon from "../atoms/icons/BellIcon";
import PageHeader from "@atoms/PageHeader";
import SearchBar from "@atoms/SearchBar";
import Button from "@atoms/Button";
import ConfirmDialog from "@molecules/ConfirmDialog";
import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { ActiveView } from "../../types/views";
import { authRoutePaths } from "../../router";
import { logoutCurrentSession, useAuthSession } from "../../features/auth";
import { useToast } from "../../shared/toast/useToast";
import { AuthApiError } from "../../api/auth/methods/http-error";
import { brand, colors } from "../../config";
import {
  primaryNavigationItems,
  secondaryNavigationItems,
  viewTitles,
} from "../../router/navigation";

interface HeaderProps {
  activeView: ActiveView;
  search?: string;
  onSearchChange?: (value: string) => void;
  onBellClick?: () => void;
  actions?: React.ReactNode;
  onNavigate?: (view: ActiveView) => void;
  onMenuClick?: () => void;
}

export default function Header({
  activeView,
  onNavigate,
  onMenuClick,
}: HeaderProps) {
  const navigate = useNavigate();
  const { session, clearSession, hasPageAccess } = useAuthSession();
  const { showSuccess, showError } = useToast();

  const info = viewTitles[activeView as keyof typeof viewTitles] || {
    title: "Painel",
    subtitle: "",
  };
  const [search, setSearch] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const sidebarItems = [
    ...primaryNavigationItems.filter((item) => hasPageAccess(item.id)),
    ...secondaryNavigationItems,
  ];
  const filtered =
    search.length > 0
      ? sidebarItems.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase()),
        )
      : [];

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
      navigate(authRoutePaths.login, { replace: true });
    }
  }

  return (
    <>
      <PageHeader
        title={info.title}
        subtitle={info.subtitle}
        actions={
          <>
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3a2f5e] bg-[#19142b] text-[#f5f2ff] lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>
            <div className="relative w-full sm:max-w-xs">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Procurar menus..."
                icon={<SearchIcon size={14} />}
                className="bg-[#19142b] text-[#f7f5ff]"
              />
              {filtered.length > 0 && (
                <div className="absolute left-0 z-50 mt-1 w-full rounded border border-[#3a2f5e] bg-[#171329] shadow">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      className="w-full text-left px-4 py-2 hover:bg-[#221a39] text-[#f7f5ff] text-sm"
                      onClick={() => {
                        setSearch("");
                        if (onNavigate) onNavigate(item.id as ActiveView);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {item.label}
                        {item.icon}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              style={{
                position: "relative",
                background: "#19142b",
                color: "#f5f2ff",
              }}
              onClick={() => {}}
            >
              <BellIcon size={16} />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: "#D4AF37" }}
              />
            </Button>
            <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #4F2D9B, #D4AF37)",
                }}
              >
                {session?.user?.name?.slice(0, 2).toUpperCase() ||
                  brand.initials}
              </div>
              <div className="hidden sm:block">
                <p
                  className="text-xs font-semibold"
                  style={{ color: colors.brown[800] }}
                >
                  {session?.user?.name || brand.name}
                </p>
                <p className="text-xs" style={{ color: colors.brown[500] }}>
                  {session?.user?.group || "Administrador"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoutDialogOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors hover:bg-[#fdecef]"
                style={{ borderColor: "#f3d0d9", color: "#b4233f" }}
                aria-label="Sair"
                title="Sair"
              >
                <LogOut size={17} />
              </button>
            </div>
          </>
        }
      />

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
