import { cancelSubscription } from "../../../api/billing/methods/cancelSubscription";
import { getMyBillingPayments } from "../../../api/billing/methods/getMyBillingPayments";
import { getMySubscription } from "../../../api/billing/methods/getMySubscription";
import { subscribeToPro } from "../../../api/billing/methods/subscribeToPro";
import {
  BillingPaymentsResponseSchema,
  SubscribeToProResponseSchema,
  SubscriptionSchema,
  type BillingPaymentListQueryParams,
  type BillingPaymentsResponse,
  type CancelSubscriptionPayload,
  type SubscribeToProPayload,
  type SubscribeToProResponse,
  type Subscription,
} from "../../../api/billing/schema";

export async function fetchMySubscription(): Promise<Subscription> {
  const response = await getMySubscription();
  const parsed = SubscriptionSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar os dados da assinatura.");
  }

  return parsed.data;
}

export async function requestSubscribeToPro(
  payload: SubscribeToProPayload,
): Promise<SubscribeToProResponse> {
  const response = await subscribeToPro(payload);
  const parsed = SubscribeToProResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar a resposta da assinatura.");
  }

  return parsed.data;
}

export async function requestCancelSubscription(
  payload: CancelSubscriptionPayload,
): Promise<Subscription> {
  const response = await cancelSubscription(payload);
  const parsed = SubscriptionSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar os dados da assinatura.");
  }

  return parsed.data;
}

export async function fetchMyBillingPayments(
  params: BillingPaymentListQueryParams = {},
): Promise<BillingPaymentsResponse> {
  const response = await getMyBillingPayments(params);
  const parsed = BillingPaymentsResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Não foi possível interpretar o histórico de pagamentos.");
  }

  return parsed.data;
}
