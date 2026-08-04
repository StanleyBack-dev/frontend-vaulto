import { type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@atoms/Button";
import { colors, radii, typography } from "../../config";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "warning" | "danger";
  icon?: ReactNode;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const badgeStyles: Record<
  NonNullable<ConfirmDialogProps["variant"]>,
  { background: string; color: string }
> = {
  default: { background: `${colors.purple[500]}1f`, color: colors.purple[500] },
  warning: { background: "#fef3c7", color: "#b45309" },
  danger: { background: "#b4233f1f", color: "#b4233f" },
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  icon,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const badge = badgeStyles[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#06050d]/70 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-2xl"
        style={{ borderColor: colors.brown[100], borderRadius: radii.lg }}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{ background: badge.background, color: badge.color }}
          >
            {icon ?? <AlertTriangle size={20} />}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h2
              className="text-base font-bold"
              style={{
                color: colors.brown[800],
                fontFamily: typography.fontFamily,
              }}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div
          className="px-6 pb-6 text-sm leading-relaxed"
          style={{
            color: colors.brown[500],
            fontFamily: typography.fontFamily,
          }}
        >
          {description}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 border-t px-6 py-4"
          style={{ borderColor: colors.brown[100] }}
        >
          <Button
            type="button"
            variant="outline"
            className="!border-gray-400 !text-gray-700 hover:!bg-gray-100"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
