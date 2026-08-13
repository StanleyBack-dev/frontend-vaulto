import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { ReplyToSupportTicketPayload, SupportTicket } from "../schema";

export async function replyToSupportTicket(
  payload: ReplyToSupportTicketPayload,
): Promise<SupportTicket> {
  try {
    const response = await apiHttp.post<SupportTicket>(
      `/support/tickets/${payload.idSupportMessage}/reply`,
      { reply: payload.reply },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível enviar a resposta."),
    );
  }
}
