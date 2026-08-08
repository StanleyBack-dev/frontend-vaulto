import { apiHttp, getApiErrorMessage } from "../../shared/http-client";
import type {
  BillingPaymentListQueryParams,
  BillingPaymentsResponse,
} from "../schema";

export async function getMyBillingPayments(
  params: BillingPaymentListQueryParams = {},
): Promise<BillingPaymentsResponse> {
  try {
    const response = await apiHttp.get<BillingPaymentsResponse>(
      "/billing/payments",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Não foi possível carregar o histórico de pagamentos.",
      ),
    );
  }
}
