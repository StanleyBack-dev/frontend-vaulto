import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@atoms/Button";
import { planRoutePaths } from "@/router";
import { colors, radii, typography } from "../../config";

interface UpgradeModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function UpgradeModal({
  open,
  message,
  onClose,
}: UpgradeModalProps) {
  const navigate = useNavigate();

  if (!open) return null;

  function handleViewPlans() {
    onClose();
    navigate(planRoutePaths.list);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#06050d]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-2xl"
        style={{ borderColor: colors.brown[100], borderRadius: radii.lg }}
      >
        <div className="flex items-start gap-4 p-6 pb-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `${colors.gold[500]}1f`,
              color: colors.gold[600],
            }}
          >
            <Crown size={20} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h2
              className="text-base font-bold"
              style={{
                color: colors.brown[800],
                fontFamily: typography.fontFamily,
              }}
            >
              Limite do plano Free atingido
            </h2>
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{
                color: colors.brown[500],
                fontFamily: typography.fontFamily,
              }}
            >
              {message}
            </p>
          </div>
        </div>

        <div
          className="flex justify-end gap-3 border-t px-6 py-4"
          style={{ borderColor: colors.brown[100] }}
        >
          <Button
            type="button"
            variant="outline"
            className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
            onClick={onClose}
          >
            Agora não
          </Button>
          <Button type="button" variant="primary" onClick={handleViewPlans}>
            Ver planos
          </Button>
        </div>
      </div>
    </div>
  );
}
