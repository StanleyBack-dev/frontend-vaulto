import { getMySupportMessageStatus } from "../../../api/support/methods/getMySupportMessageStatus";
import { sendSupportMessage } from "../../../api/support/methods/sendSupportMessage";
import {
  SupportMessageSchema,
  SupportMessageStatusSchema,
  type SendSupportMessagePayload,
  type SupportMessage,
  type SupportMessageStatus,
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
