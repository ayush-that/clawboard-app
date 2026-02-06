"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useRef } from "react";

const PANEL_NAMES = [
  "sessions",
  "logs",
  "cron",
  "memory",
  "skills",
  "usage",
  "channels",
  "config",
  "settings",
] as const;

export type PanelName = (typeof PANEL_NAMES)[number];

const isValidPanel = (value: string | null): value is PanelName =>
  value !== null && PANEL_NAMES.includes(value as PanelName);

export const panelLabels: Record<PanelName, string> = {
  sessions: "Sessions",
  logs: "Logs",
  cron: "Cron",
  memory: "Memory",
  skills: "Skills",
  usage: "Usage",
  channels: "Channels",
  config: "Config",
  settings: "Settings",
};

type ActiveView = { type: "chat" } | { type: "panel"; panel: PanelName };

type ActiveViewContextValue = {
  activeView: ActiveView;
  isDashboard: boolean;
  activePanel: PanelName | null;
  setChat: () => void;
  setPanel: (panel: PanelName) => void;
};

const ActiveViewContext = createContext<ActiveViewContextValue | null>(null);

export const ActiveViewProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const panelParam = searchParams.get("panel");
  const validPanel = isValidPanel(panelParam) ? panelParam : null;

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const setChat = useCallback(() => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    params.delete("panel");
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, {
      scroll: false,
    });
  }, [router]);

  const setPanel = useCallback(
    (panel: PanelName) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      params.set("panel", panel);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const value = useMemo(
    () => ({
      activeView: (validPanel
        ? { type: "panel" as const, panel: validPanel }
        : { type: "chat" as const }) satisfies ActiveView,
      isDashboard: validPanel !== null,
      activePanel: validPanel,
      setChat,
      setPanel,
    }),
    [validPanel, setChat, setPanel]
  );

  return (
    <ActiveViewContext.Provider value={value}>
      {children}
    </ActiveViewContext.Provider>
  );
};

export const useActiveView = (): ActiveViewContextValue => {
  const context = useContext(ActiveViewContext);
  if (!context) {
    throw new Error("useActiveView must be used within ActiveViewProvider");
  }
  return context;
};
