export const PLAN_LIMIT_REACHED_CODE = "BILLING_PLAN_LIMIT_REACHED";

export class PlanLimitReachedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanLimitReachedError";
  }
}
