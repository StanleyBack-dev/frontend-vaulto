import type { CancellationReason } from "@/api/billing/schema";
import Checkbox from "@atoms/Checkbox";
import Textarea from "@atoms/Textarea";
import { colors } from "../../config";

const CANCELLATION_REASON_OPTIONS: Array<{
  value: CancellationReason;
  label: string;
}> = [
  {
    value: "DOES_NOT_MEET_NEEDS",
    label: "Não atende mais minhas necessidades",
  },
  {
    value: "TOO_EXPENSIVE",
    label: "Muito caro / falta de dinheiro no momento",
  },
  { value: "FOUND_ALTERNATIVE", label: "Encontrei uma alternativa melhor" },
  { value: "HARD_TO_USE", label: "Difícil de usar" },
  {
    value: "MISSING_FEATURES",
    label: "Faltam funcionalidades que eu precisava",
  },
  { value: "TEMPORARY_USE", label: "Uso apenas temporariamente" },
  { value: "TECHNICAL_ISSUES", label: "Problemas técnicos / bugs" },
  { value: "OTHER", label: "Outro motivo" },
];

interface CancellationSurveyFieldsProps {
  reasons: CancellationReason[];
  onToggleReason: (reason: CancellationReason) => void;
  otherReason: string;
  onOtherReasonChange: (value: string) => void;
}

export default function CancellationSurveyFields({
  reasons,
  onToggleReason,
  otherReason,
  onOtherReasonChange,
}: CancellationSurveyFieldsProps) {
  return (
    <div className="space-y-4">
      <p style={{ color: colors.brown[500] }}>
        Você continuará com acesso ao Vaulto Pro até o fim do período já pago,
        mas a assinatura não será renovada. Antes de confirmar, nos conte o que
        motivou o cancelamento (pode marcar mais de um):
      </p>

      <div className="space-y-2.5">
        {CANCELLATION_REASON_OPTIONS.map((option) => (
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
