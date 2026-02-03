"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useActiveView } from "@/lib/contexts/active-view-context";
import { DashboardPanelView } from "./dashboard-panel-view";

export const MainContentSwitcher = ({ children }: { children: ReactNode }) => {
  const { isDashboard, setChat } = useActiveView();
  const pathname = usePathname();

  // Auto-reset to chat mode on URL navigation (browser back/forward)
  useEffect(() => {
    if (isDashboard && (pathname === "/" || pathname?.startsWith("/chat/"))) {
      setChat();
    }
  }, [pathname, isDashboard, setChat]);

  if (isDashboard) {
    return <DashboardPanelView />;
  }

  return <>{children}</>;
};
