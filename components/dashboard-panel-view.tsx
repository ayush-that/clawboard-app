"use client";

import type { PanelName } from "@/lib/contexts/active-view-context";
import { useActiveView } from "@/lib/contexts/active-view-context";
import { EventFeed } from "./dashboard/event-feed";
import { ChannelsTab } from "./dashboard/tabs/channels-tab";
import { ConfigTab } from "./dashboard/tabs/config-tab";
import { CronTab } from "./dashboard/tabs/cron-tab";
import { DebugTab } from "./dashboard/tabs/debug-tab";
import { LogsTab } from "./dashboard/tabs/logs-tab";
import { MemoryTab } from "./dashboard/tabs/memory-tab";
import { SessionsTab } from "./dashboard/tabs/sessions-tab";
import { SkillsTab } from "./dashboard/tabs/skills-tab";
import { StatusTab } from "./dashboard/tabs/status-tab";
import { TasksTab } from "./dashboard/tabs/tasks-tab";
import { UsageTab } from "./dashboard/tabs/usage-tab";

const panels: Record<PanelName, () => JSX.Element> = {
  status: StatusTab,
  tasks: TasksTab,
  sessions: SessionsTab,
  logs: LogsTab,
  cron: CronTab,
  memory: MemoryTab,
  skills: SkillsTab,
  usage: UsageTab,
  channels: ChannelsTab,
  config: ConfigTab,
  debug: DebugTab,
};

export const DashboardPanelView = () => {
  const { activePanel } = useActiveView();

  if (!activePanel) {
    return null;
  }

  const PanelComponent = panels[activePanel];

  return (
    <div className="flex h-dvh flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <PanelComponent />
      </div>
      <EventFeed />
    </div>
  );
};
