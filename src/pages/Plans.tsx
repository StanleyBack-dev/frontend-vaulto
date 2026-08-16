import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionCard from "@/components/organisms/SectionCard";
import PlanComparisonTable from "@organisms/PlanComparisonTable";
import SubscribeToProModal from "@organisms/SubscribeToProModal";
import PlanPriceCard from "@molecules/PlanPriceCard";
import Button from "@atoms/Button";
import PlanBadge from "@atoms/PlanBadge";
import { useToast } from "../shared/toast/useToast";
import {
  PAYMENT_METHODS_DESCRIPTION,
  PRO_PLAN_MONTHLY_EQUIVALENT_WHEN_YEARLY,
  PRO_PLAN_PRICES,
  useBillingContext,
} from "@/features/billing";
import { settingsRoutePaths } from "@/router/navigation";
import { colors } from "@/config";

export default function Plans() {
  const navigate = useNavigate();
  const { subscription, isPro, refresh } = useBillingContext();
  const { showSuccess, showError } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isProActive = isPro && subscription?.status === "ACTIVE";

  function handleSubscribed(checkoutUrl?: string) {
    setIsModalOpen(false);

    if (checkoutUrl) {
      showSuccess(
        "Quase lá!",
        "Você será redirecionado para concluir o pagamento.",
      );
      window.location.href = checkoutUrl;
      return;
    }

    showError(
      "Assinatura iniciada",
      "Não recebemos o link de pagamento. Tente novamente em instantes.",
    );
    void refresh();
  }

  function handlePixAuthorizationCreated() {
    setIsModalOpen(false);
    showSuccess(
      "Pix Automático criado!",
      "Assim que o pagamento for confirmado, seu Pro é ativado automaticamente.",
    );
    void refresh();
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="outline"
        className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
        leftIcon={<ArrowLeft size={16} />}
        onClick={() => navigate(settingsRoutePaths.list)}
      >
        Voltar para Configurações
      </Button>

      <SectionCard
        title="Escolha o seu plano"
        description="Comece grátis e evolua para o Pro quando precisar de mais controle sobre suas finanças."
      >
        {subscription && (
          <div className="mb-5 flex items-center gap-2">
            <span className="text-sm" style={{ color: colors.brown[500] }}>
              Seu plano atual:
            </span>
            <PlanBadge plan={subscription.plan} status={subscription.status} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <PlanPriceCard
            title="Free"
            price="R$ 0"
            priceSuffix="/sempre"
            features={[
              "Até 5 dívidas",
              "1 cartão de crédito",
              "Até 10 receitas por mês",
              "Categorias básicas",
              "Extratos dos últimos 3 meses",
              "Dashboard e filtros básicos",
            ]}
            footer={
              !subscription || subscription.plan === "FREE" ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className="w-full !border-transparent !text-white"
                  style={{ background: colors.black[800] }}
                >
                  Seu plano atual
                </Button>
              ) : undefined
            }
          />

          <PlanPriceCard
            title="Vaulto Pro"
            price={`R$ ${PRO_PLAN_PRICES.MONTHLY.toFixed(2).replace(".", ",")}`}
            priceSuffix="/mês"
            hint={`ou R$ ${PRO_PLAN_PRICES.YEARLY.toFixed(2).replace(".", ",")}/ano (equivale a R$ ${PRO_PLAN_MONTHLY_EQUIVALENT_WHEN_YEARLY.toFixed(2).replace(".", ",")}/mês)`}
            highlighted
            features={[
              "Dívidas, receitas e cartões ilimitados",
              "Histórico completo e filtros avançados",
              "Relatórios avançados e comparativos",
              "Exportação em PDF/Excel",
              "Lembretes e calendário financeiro",
              "Previsão financeira e metas",
            ]}
            footer={
              isProActive ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className="w-full !border-transparent !text-white"
                  style={{ background: colors.black[800] }}
                >
                  Assinatura ativa
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={() => setIsModalOpen(true)}
                >
                  Assinar Vaulto Pro
                </Button>
              )
            }
          />
        </div>

        <p
          className="mt-5 text-xs leading-relaxed"
          style={{ color: colors.brown[500] }}
        >
          {PAYMENT_METHODS_DESCRIPTION}
        </p>
      </SectionCard>

      <SectionCard
        title="Compare os recursos"
        description="Tudo que muda entre o Free e o Pro, lado a lado."
      >
        <PlanComparisonTable />
      </SectionCard>

      <SubscribeToProModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubscribed={handleSubscribed}
        onPixAuthorizationCreated={handlePixAuthorizationCreated}
      />
    </div>
  );
}
