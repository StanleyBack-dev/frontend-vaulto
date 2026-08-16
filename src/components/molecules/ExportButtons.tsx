import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, FileText, Lock } from "lucide-react";
import Button from "../atoms/Button";
import {
  downloadExport,
  type ExportFormat,
  type ExportResourcePath,
} from "../../api/exports/methods/download";
import { useBillingContext } from "../../features/billing";
import { planRoutePaths } from "../../router";
import { useToast } from "../../shared/toast/useToast";

interface ExportButtonsProps {
  resource: ExportResourcePath;
  filters?: Record<string, string | undefined>;
  disabled?: boolean;
  disabledMessage?: string;
  className?: string;
}

export default function ExportButtons({
  resource,
  filters,
  disabled,
  disabledMessage,
  className = "",
}: ExportButtonsProps) {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { isPro, isLoading: isSubscriptionLoading } = useBillingContext();
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);

  async function handleDownload(format: ExportFormat) {
    if (disabled || loadingFormat) {
      return;
    }

    setLoadingFormat(format);
    try {
      const { blob, filename } = await downloadExport(
        resource,
        format,
        filters,
      );
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
      showSuccess("Exportação concluída", `Arquivo ${filename} baixado.`);
    } catch (error) {
      showError(
        "Não foi possível exportar",
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setLoadingFormat(null);
    }
  }

  if (isSubscriptionLoading) {
    return null;
  }

  if (!isPro) {
    return (
      <Button
        type="button"
        variant="primary"
        size="sm"
        leftIcon={<Lock size={14} />}
        onClick={() => navigate(planRoutePaths.list)}
        className={className}
        title="Exportação é um recurso exclusivo do Vaulto Pro"
      >
        Exportar
      </Button>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      title={disabled ? disabledMessage : undefined}
    >
      <Button
        type="button"
        variant="primary"
        size="sm"
        leftIcon={<FileText size={14} />}
        disabled={disabled || loadingFormat !== null}
        loading={loadingFormat === "pdf"}
        onClick={() => handleDownload("pdf")}
      >
        PDF
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        leftIcon={<FileSpreadsheet size={14} />}
        disabled={disabled || loadingFormat !== null}
        loading={loadingFormat === "xlsx"}
        onClick={() => handleDownload("xlsx")}
      >
        Excel
      </Button>
    </div>
  );
}
