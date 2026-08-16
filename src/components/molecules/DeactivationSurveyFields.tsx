import type { AccountDeactivationReason } from "@/api/account-lifecycle/schema";
import Checkbox from "@atoms/Checkbox";
import Textarea from "@atoms/Textarea";
import { colors } from "../../config";

const DEACTIVATION_REASON_OPTIONS: Array<{
  value: AccountDeactivationReason;
  label: string;
}> = [
  { value: "NOT_USING_ANYMORE", label: "Não estou usando mais" },
  { value: "TAKING_A_BREAK", label: "Quero pausar temporariamente" },
  {
    value: "TOO_MANY_NOTIFICATIONS",
    label: "Recebo notificações/e-mails demais",
  },
  { value: "FOUND_ALTERNATIVE", label: "Encontrei uma alternativa melhor" },
  { value: "HARD_TO_USE", label: "Difícil de usar" },
  { value: "OTHER", label: "Outro motivo" },
];

interface DeactivationSurveyFieldsProps {
  reasons: AccountDeactivationReason[];
  onToggleReason: (reason: AccountDeactivationReason) => void;
  otherReason: string;
  onOtherReasonChange: (value: string) => void;
}

export default function DeactivationSurveyFields({
  reasons,
  onToggleReason,
  otherReason,
  onOtherReasonChange,
}: DeactivationSurveyFieldsProps) {
  return (
    <div className="space-y-4">
      <p style={{ color: colors.brown[500] }}>
        Sua conta ficará inativa e seus dados continuam guardados com segurança.
        Para voltar, é só fazer login novamente que sua conta será reativada
        automaticamente. Antes de confirmar, nos conte o que motivou a
        inativação (pode marcar mais de um):
      </p>

      <div className="space-y-2.5">
        {DEACTIVATION_REASON_OPTIONS.map((option) => (
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
