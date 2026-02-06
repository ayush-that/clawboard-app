"use client";

import dynamic from "next/dynamic";
import type React from "react";
import type { PanelName } from "@/lib/contexts/active-view-context";
import { useActiveView } from "@/lib/contexts/active-view-context";
import { SidebarToggle } from "./sidebar-toggle";

const TabSkeleton = () => (
  <div className="flex flex-col gap-4 p-6">
    <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
    <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
    <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
    <div className="h-32 w-full animate-pulse rounded-md bg-muted" />
  </div>
);

const SessionsTab = dynamic(
  () =>
    import("./dashboard/tabs/sessions-tab").then((m) => ({
      default: m.SessionsTab,
    })),
  { ssr: false, loading: TabSkeleton }
);
const LogsTab = dynamic(
  () =>
    import("./dashboard/tabs/logs-tab").then((m) => ({ default: m.LogsTab })),
  { ssr: false, loading: TabSkeleton }
);
const CronTab = dynamic(
  () =>
    import("./dashboard/tabs/cron-tab").then((m) => ({ default: m.CronTab })),
  { ssr: false, loading: TabSkeleton }
);
const MemoryTab = dynamic(
  () =>
    import("./dashboard/tabs/memory-tab").then((m) => ({
      default: m.MemoryTab,
    })),
  { ssr: false, loading: TabSkeleton }
);
const SkillsTab = dynamic(
  () =>
    import("./dashboard/tabs/skills-tab").then((m) => ({
      default: m.SkillsTab,
    })),
  { ssr: false, loading: TabSkeleton }
);
const UsageTab = dynamic(
  () =>
    import("./dashboard/tabs/usage-tab").then((m) => ({
      default: m.UsageTab,
    })),
  { ssr: false, loading: TabSkeleton }
);
const ChannelsTab = dynamic(
  () =>
    import("./dashboard/tabs/channels-tab").then((m) => ({
      default: m.ChannelsTab,
    })),
  { ssr: false, loading: TabSkeleton }
);
const ConfigTab = dynamic(
  () =>
    import("./dashboard/tabs/config-tab").then((m) => ({
      default: m.ConfigTab,
    })),
  { ssr: false, loading: TabSkeleton }
);
const SettingsTab = dynamic(
  () =>
    import("./dashboard/tabs/settings-tab").then((m) => ({
      default: m.SettingsTab,
    })),
  { ssr: false, loading: TabSkeleton }
);

const panels: Record<PanelName, React.ComponentType> = {
  sessions: SessionsTab,
  logs: LogsTab,
  cron: CronTab,
  memory: MemoryTab,
  skills: SkillsTab,
  usage: UsageTab,
  channels: ChannelsTab,
  config: ConfigTab,
  settings: SettingsTab,
};

export const DashboardPanelView = () => {
  const { activePanel } = useActiveView();

  if (!activePanel) {
    return null;
  }

  const PanelComponent = panels[activePanel];

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
        <SidebarToggle />
      </header>
      <div className="flex-1 overflow-y-auto">
        <PanelComponent />
      </div>
    </div>
  );
};
