import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import DataTable, {
  type DataTableColumn,
} from "@/components/organisms/DataTable";
import Select from "@atoms/Select";
import {
  fetchSupportTickets,
  type SupportTicket,
  type SupportTicketStatus,
} from "@/features/support";
import { supportTicketRoutePaths } from "@/router";
import { colors } from "@/config";

const CATEGORY_LABELS: Record<string, string> = {
  DOUBT: "Dúvida",
  TECHNICAL_ISSUE: "Problema técnico / Bug",
  SUGGESTION: "Sugestão",
  BILLING: "Financeiro / Cobrança",
  OTHER: "Outro",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Aberto",
  ANSWERED: "Respondido",
  RESOLVED: "Finalizado",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminSupportTicketsTab() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "">(
    "",
  );

  const load = useCallback(() => {
    setLoading(true);

    fetchSupportTickets({
      status: statusFilter || undefined,
      limit: 50,
    })
      .then((result) => {
        setTickets(result.items);
      })
      .catch(() => {
        setTickets([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openTicket(ticket: SupportTicket) {
    navigate(supportTicketRoutePaths.detail(ticket.idSupportMessage));
  }

  const columns: DataTableColumn<SupportTicket>[] = [
    {
      key: "actions",
      label: "",
      render: (ticket) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openTicket(ticket);
          }}
          aria-label={`Abrir chamado #${String(ticket.protocolNumber).padStart(6, "0")}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
          style={{ color: colors.purple[700] }}
        >
          <Eye size={16} />
        </button>
      ),
    },
    {
      key: "protocolNumber",
      label: "Protocolo",
      render: (ticket) => `#${String(ticket.protocolNumber).padStart(6, "0")}`,
    },
    { key: "userName", label: "Usuário" },
    { key: "userEmail", label: "E-mail" },
    {
      key: "category",
      label: "Categoria",
      render: (ticket) => CATEGORY_LABELS[ticket.category] ?? ticket.category,
    },
    {
      key: "status",
      label: "Status",
      render: (ticket) => STATUS_LABELS[ticket.status] ?? ticket.status,
    },
    {
      key: "createdAt",
      label: "Enviado em",
      render: (ticket) => formatDate(ticket.createdAt),
    },
    {
      key: "finalizedByName",
      label: "Finalizado por",
      render: (ticket) => ticket.finalizedByName ?? "—",
    },
    {
      key: "finalizedAt",
      label: "Finalizado em",
      render: (ticket) =>
        ticket.finalizedAt ? formatDate(ticket.finalizedAt) : "—",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Select
          label="Status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as SupportTicketStatus | "")
          }
        >
          <option value="">Todos</option>
          <option value="OPEN">Aberto</option>
          <option value="ANSWERED">Respondido</option>
          <option value="RESOLVED">Finalizado</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2"
            style={{
              borderColor: colors.gold[500],
              borderTopColor: "transparent",
            }}
          />
        </div>
      ) : (
        <DataTable
          data={tickets}
          columns={columns}
          getId={(ticket) => ticket.idSupportMessage}
          emptyMessage="Nenhum chamado encontrado."
        />
      )}
    </div>
  );
}
