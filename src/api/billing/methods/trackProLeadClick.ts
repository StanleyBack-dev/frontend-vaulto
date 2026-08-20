import { apiHttp } from "../../shared/http-client";

export async function trackProLeadClick(): Promise<void> {
  await apiHttp.post("/billing/track-lead-click");
}
