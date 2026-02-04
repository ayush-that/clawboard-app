"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type PanelName =
  | "sessions"
  | "logs"
  | "cron"
  | "memory"
  | "skills"
  | "usage"
  | "channels"
  | "config"
  | "settings";

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
  const [activeView, setActiveView] = useState<ActiveView>({ type: "chat" });

  const setChat = useCallback(() => {
    setActiveView({ type: "chat" });
  }, []);

  const setPanel = useCallback((panel: PanelName) => {
    setActiveView({ type: "panel", panel });
  }, []);

  const value = useMemo(
    () => ({
      activeView,
      isDashboard: activeView.type === "panel",
      activePanel: activeView.type === "panel" ? activeView.panel : null,
      setChat,
      setPanel,
    }),
    [activeView, setChat, setPanel]
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
