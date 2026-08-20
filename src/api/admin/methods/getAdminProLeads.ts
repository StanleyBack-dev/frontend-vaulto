import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  AdminProLeadsQueryParams,
  AdminProLeadsResponse,
} from "../schema";

export async function getAdminProLeads(
  params: AdminProLeadsQueryParams = {},
): Promise<AdminProLeadsResponse> {
  try {
    const response = await apiHttp.get<AdminProLeadsResponse>(
      "/admin/pro-leads",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Não foi possível carregar os leads."),
    );
  }
}
