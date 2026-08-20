import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Gift,
  Headset,
  LayoutDashboard,
  Users as UsersIcon,
} from "lucide-react";
import SectionCard from "@/components/organisms/SectionCard";
import { UsersProvider } from "@/features/users";
import Users from "@/pages/users/Users";
import { colors, typography } from "@/config";
import AdminOverviewTab from "./AdminOverviewTab";
import AdminReferralsTab from "./AdminReferralsTab";
import AdminSupportTicketsTab from "./AdminSupportTicketsTab";

type AdminTab = "overview" | "users" | "referrals" | "tickets";

const TABS: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
  { id: "overview", label: "Visão Geral", icon: <LayoutDashboard size={16} /> },
  { id: "users", label: "Usuários", icon: <UsersIcon size={16} /> },
  { id: "referrals", label: "Indicações", icon: <Gift size={16} /> },
  { id: "tickets", label: "Chamados de Suporte", icon: <Headset size={16} /> },
];

function isAdminTab(value: unknown): value is AdminTab {
  return (
    value === "overview" ||
    value === "users" ||
    value === "referrals" ||
    value === "tickets"
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  const initialTab = isAdminTab((location.state as { tab?: unknown })?.tab)
    ? (location.state as { tab: AdminTab }).tab
    : "overview";
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  return (
    <div className="space-y-6">
      <SectionCard title="Painel de Administração">
        <div
          className="flex flex-wrap gap-2 border-b pb-4"
          style={{ borderColor: colors.brown[100] }}
        >
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
                style={{
                  fontFamily: typography.fontFamily,
                  background: isActive ? colors.purple[500] : "transparent",
                  color: isActive ? "#ffffff" : colors.brown[500],
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="pt-6">
          {activeTab === "overview" && <AdminOverviewTab />}
          {activeTab === "users" && (
            <UsersProvider>
              <Users />
            </UsersProvider>
          )}
          {activeTab === "referrals" && <AdminReferralsTab />}
          {activeTab === "tickets" && <AdminSupportTicketsTab />}
        </div>
      </SectionCard>
    </div>
  );
}
