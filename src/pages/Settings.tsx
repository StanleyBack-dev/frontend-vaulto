import { useNavigate } from "react-router-dom";
import SectionCard from "@/components/organisms/SectionCard";
import SettingsLinkItem from "@molecules/SettingsLinkItem";
import { useBillingContext } from "@/features/billing";
import {
  settingsPageItems,
  viewTitles,
  getPathForView,
} from "@/router/navigation";

export default function Settings() {
  const navigate = useNavigate();
  const { isPro } = useBillingContext();

  return (
    <div className="space-y-6">
      <SectionCard
        title="Configurações"
        description="Planos, indicações, lembretes, ajuda e outras opções da sua conta."
      >
        <div className="space-y-3">
          {settingsPageItems.map((item) => (
            <SettingsLinkItem
              key={item.id}
              icon={item.icon}
              title={item.label}
              description={viewTitles[item.id].subtitle}
              showProBadge={item.proOnly && !isPro}
              onClick={() => navigate(getPathForView(item.id))}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
