import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  ListSupportTicketsQueryParams,
  SupportTicketsResponse,
} from "../schema";

export async function listSupportTickets(
  params: ListSupportTicketsQueryParams = {},
): Promise<SupportTicketsResponse> {
  try {
    const response = await apiHttp.get<SupportTicketsResponse>(
      "/support/tickets",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar os chamados."),
    );
  }
}
