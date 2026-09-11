import { useCallback, useEffect, useState } from "react";
import {
  readStoredSidebarCollapsed,
  writeStoredSidebarCollapsed,
} from "./sidebar-collapse-storage";

interface UseSidebarCollapsedResult {
  collapsed: boolean;
  toggle: () => void;
}

// Desktop-only concern: the collapsed rail is never shown below the `lg`
// breakpoint (the sidebar is a full-width drawer there), so this state only
// drives the `lg:` layout in AppLayout/Sidebar.
export function useSidebarCollapsed(): UseSidebarCollapsedResult {
  const [collapsed, setCollapsed] = useState<boolean>(
    readStoredSidebarCollapsed,
  );

  useEffect(() => {
    writeStoredSidebarCollapsed(collapsed);
  }, [collapsed]);

  const toggle = useCallback(() => {
    setCollapsed((current) => !current);
  }, []);

  return { collapsed, toggle };
}
