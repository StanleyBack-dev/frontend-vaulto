import type { AccountDeletionReason } from "@/api/account-lifecycle/schema";
import Checkbox from "@atoms/Checkbox";
import Textarea from "@atoms/Textarea";
import { colors } from "../../config";

const DELETION_REASON_OPTIONS: Array<{
  value: AccountDeletionReason;
  label: string;
}> = [
  { value: "NOT_USING_ANYMORE", label: "Não estou usando mais" },
  { value: "PRIVACY_CONCERNS", label: "Preocupações com privacidade" },
  { value: "FOUND_ALTERNATIVE", label: "Encontrei uma alternativa melhor" },
  { value: "HARD_TO_USE", label: "Difícil de usar" },
  { value: "TECHNICAL_ISSUES", label: "Problemas técnicos / bugs" },
  { value: "OTHER", label: "Outro motivo" },
];

interface DeletionSurveyFieldsProps {
  reasons: AccountDeletionReason[];
  onToggleReason: (reason: AccountDeletionReason) => void;
  otherReason: string;
  onOtherReasonChange: (value: string) => void;
  gracePeriodDays: number;
}

export default function DeletionSurveyFields({
  reasons,
  onToggleReason,
  otherReason,
  onOtherReasonChange,
  gracePeriodDays,
}: DeletionSurveyFieldsProps) {
  return (
    <div className="space-y-4">
      <p style={{ color: colors.brown[500] }}>
        Seus dados pessoais (dívidas, receitas, categorias, cartões, metas e
        chamados de suporte) serão apagados permanentemente em {gracePeriodDays}{" "}
        dias. Até lá, sua conta continua funcionando normalmente e você pode
        cancelar essa solicitação a qualquer momento na tela de Perfil. Antes de
        confirmar, nos conte o que motivou a exclusão (pode marcar mais de um):
      </p>

      <div className="space-y-2.5">
        {DELETION_REASON_OPTIONS.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={reasons.includes(option.value)}
            onChange={() => onToggleReason(option.value)}
          />
        ))}
      </div>

      {reasons.includes("OTHER") && (
        <Textarea
          label="Conte mais (opcional)"
          rows={3}
          value={otherReason}
          onChange={(event) => onOtherReasonChange(event.target.value)}
          placeholder="O que podemos melhorar?"
        />
      )}
    </div>
  );
}
