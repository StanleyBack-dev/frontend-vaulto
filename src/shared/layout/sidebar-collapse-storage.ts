const SIDEBAR_COLLAPSED_STORAGE_KEY = "vaulto:sidebarCollapsed";

// Remembers the desktop sidebar collapse choice across reloads. Purely a
// convenience — if storage is unavailable (private mode, etc.) the sidebar
// just starts expanded every time, which must never be treated as an error.
export function readStoredSidebarCollapsed(): boolean {
  try {
    return (
      window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true"
    );
  } catch {
    return false;
  }
}

export function writeStoredSidebarCollapsed(collapsed: boolean): void {
  try {
    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      collapsed ? "true" : "false",
    );
  } catch {
    // Nothing to do — the preference just won't persist to the next visit.
  }
}
