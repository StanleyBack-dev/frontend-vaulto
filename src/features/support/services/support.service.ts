import { finalizeSupportTicket } from "../../../api/support/methods/finalizeSupportTicket";
import { getMySupportMessageStatus } from "../../../api/support/methods/getMySupportMessageStatus";
import { getSupportTicket } from "../../../api/support/methods/getSupportTicket";
import { listSupportTickets } from "../../../api/support/methods/listSupportTickets";
import { replyToSupportTicket } from "../../../api/support/methods/replyToSupportTicket";
import { sendSupportMessage } from "../../../api/support/methods/sendSupportMessage";
import {
  ListSupportTicketsQueryParamsSchema,
  SupportMessageSchema,
  SupportMessageStatusSchema,
  SupportTicketSchema,
  SupportTicketsResponseSchema,
  type ListSupportTicketsQueryParams,
  type ReplyToSupportTicketPayload,
  type SendSupportMessagePayload,
  type SupportMessage,
  type SupportMessageStatus,
  type SupportTicket,
  type SupportTicketsResponse,
} from "../../../api/support/schema";

export async function requestSendSupportMessage(
  payload: SendSupportMessagePayload,
): Promise<SupportMessage> {
  const response = await sendSupportMessage(payload);
  const parsed = SupportMessageSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar a resposta do suporte.");
  }

  return parsed.data;
}

export async function fetchMySupportMessageStatus(): Promise<SupportMessageStatus> {
  const response = await getMySupportMessageStatus();
  const parsed = SupportMessageStatusSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o status do suporte.");
  }

  return parsed.data;
}

export async function fetchSupportTickets(
  params: ListSupportTicketsQueryParams = {},
): Promise<SupportTicketsResponse> {
  const parsedParams = ListSupportTicketsQueryParamsSchema.parse(params);
  const response = await listSupportTickets(parsedParams);
  const parsed = SupportTicketsResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar os chamados de suporte.");
  }

  return parsed.data;
}

export async function fetchSupportTicket(
  idSupportMessage: string,
): Promise<SupportTicket> {
  const response = await getSupportTicket(idSupportMessage);
  const parsed = SupportTicketSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o chamado de suporte.");
  }

  return parsed.data;
}

export async function requestReplyToSupportTicket(
  payload: ReplyToSupportTicketPayload,
): Promise<SupportTicket> {
  const response = await replyToSupportTicket(payload);
  const parsed = SupportTicketSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o chamado de suporte.");
  }

  return parsed.data;
}

export async function requestFinalizeSupportTicket(
  idSupportMessage: string,
): Promise<SupportTicket> {
  const response = await finalizeSupportTicket(idSupportMessage);
  const parsed = SupportTicketSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o chamado de suporte.");
  }

  return parsed.data;
}
