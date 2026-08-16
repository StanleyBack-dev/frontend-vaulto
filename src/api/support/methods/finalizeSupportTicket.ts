import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type { SupportTicket } from "../schema";

export async function finalizeSupportTicket(
  idSupportMessage: string,
): Promise<SupportTicket> {
  try {
    const response = await apiHttp.post<SupportTicket>(
      `/support/tickets/${idSupportMessage}/finalize`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível finalizar o chamado."),
    );
  }
}
