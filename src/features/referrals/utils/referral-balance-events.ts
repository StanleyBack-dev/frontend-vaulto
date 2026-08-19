type ReferralBalanceListener = (availableBalanceCents: number) => void;

const listeners = new Set<ReferralBalanceListener>();

export function subscribeReferralBalanceEvents(
  listener: ReferralBalanceListener,
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function emitReferralBalanceChanged(
  availableBalanceCents: number,
): void {
  for (const listener of listeners) {
    listener(availableBalanceCents);
  }
}
