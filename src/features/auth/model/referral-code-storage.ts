const REFERRAL_CODE_STORAGE_KEY = "vaulto:referralCode";

// Captured once, on the login page, from a shared link like
// app.vaulto.com/?ref=CODE — persisted so it survives a reload between
// landing on the link and actually clicking "Entrar com Google" (that flow
// doesn't navigate away from /, so the query param would normally still be
// there, but this is a cheap safety net).
export function captureReferralCodeFromUrl(search: string): void {
  const code = new URLSearchParams(search).get("ref");
  if (!code) return;

  try {
    window.localStorage.setItem(REFERRAL_CODE_STORAGE_KEY, code);
  } catch {
    // Storage unavailable (private mode, etc.) — the code just won't be
    // captured; it must never block login.
  }
}

export function readStoredReferralCode(): string | undefined {
  try {
    return window.localStorage.getItem(REFERRAL_CODE_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function clearStoredReferralCode(): void {
  try {
    window.localStorage.removeItem(REFERRAL_CODE_STORAGE_KEY);
  } catch {
    // Nothing to do — worst case it's just read again harmlessly (a bad or
    // already-consumed code is ignored) or overwritten next time.
  }
}
