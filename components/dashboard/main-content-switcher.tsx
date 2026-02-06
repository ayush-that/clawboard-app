"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useActiveView } from "@/lib/contexts/active-view-context";
import { DashboardPanelView } from "./panel-view";

export const MainContentSwitcher = ({ children }: { children: ReactNode }) => {
  const { isDashboard, setChat } = useActiveView();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Auto-reset to chat mode only when the URL path actually changes
  // (e.g. browser back/forward navigates to a chat).
  // The panel query param is handled by ActiveViewProvider.
  useEffect(() => {
    if (prevPathname.current !== pathname && isDashboard) {
      setChat();
    }
    prevPathname.current = pathname;
  }, [pathname, isDashboard, setChat]);

  if (isDashboard) {
    return <DashboardPanelView />;
  }

  return <>{children}</>;
};
