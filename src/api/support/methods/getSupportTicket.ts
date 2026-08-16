import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { SupportTicket } from "../schema";

export async function getSupportTicket(
  idSupportMessage: string,
): Promise<SupportTicket> {
  try {
    const response = await apiHttp.get<SupportTicket>(
      `/support/tickets/${idSupportMessage}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar o chamado."),
    );
  }
}
