"use client";

import { EventFeed } from "@/components/dashboard/event-feed";
import { ExecApprovalOverlay } from "@/components/dashboard/exec-approval-overlay";
import { ChannelsTab } from "@/components/dashboard/tabs/channels-tab";
import { ConfigTab } from "@/components/dashboard/tabs/config-tab";
import { CronTab } from "@/components/dashboard/tabs/cron-tab";
import { DebugTab } from "@/components/dashboard/tabs/debug-tab";
import { LogsTab } from "@/components/dashboard/tabs/logs-tab";
import { MemoryTab } from "@/components/dashboard/tabs/memory-tab";
import { SessionsTab } from "@/components/dashboard/tabs/sessions-tab";
import { SkillsTab } from "@/components/dashboard/tabs/skills-tab";
import { StatusTab } from "@/components/dashboard/tabs/status-tab";
import { TasksTab } from "@/components/dashboard/tabs/tasks-tab";
import { UsageTab } from "@/components/dashboard/tabs/usage-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Exec approval overlay — global, always mounted */}
      <ExecApprovalOverlay />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/50 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦞</span>
          <div>
            <h1 className="font-mono text-lg font-semibold">ClawBoard</h1>
            <p className="text-xs text-muted-foreground">
              OpenClaw Agent Dashboard
            </p>
          </div>
        </div>
        <a
          className="rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          href="/"
        >
          Chat
        </a>
      </header>

      {/* Tabbed content */}
      <Tabs className="flex min-h-0 flex-1 flex-col" defaultValue="status">
        <div className="border-b border-border/50 px-4 pt-2">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="cron">Cron</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>
        </div>

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <TabsContent className="flex-1" value="status">
            <StatusTab />
          </TabsContent>
          <TabsContent className="flex-1" value="tasks">
            <TasksTab />
          </TabsContent>
          <TabsContent className="flex-1" value="sessions">
            <SessionsTab />
          </TabsContent>
          <TabsContent className="flex-1" value="logs">
            <LogsTab />
          </TabsContent>
          <TabsContent className="flex-1" value="cron">
            <CronTab />
          </TabsContent>
          <TabsContent className="flex-1" value="memory">
            <MemoryTab />
          </TabsContent>
          <TabsContent className="flex-1" value="skills">
            <SkillsTab />
          </TabsContent>
          <TabsContent className="flex-1" value="usage">
            <UsageTab />
          </TabsContent>
          <TabsContent className="flex-1" value="channels">
            <ChannelsTab />
          </TabsContent>
          <TabsContent className="flex-1" value="config">
            <ConfigTab />
          </TabsContent>
          <TabsContent className="flex-1" value="debug">
            <DebugTab />
          </TabsContent>
        </main>
      </Tabs>

      {/* Event feed */}
      <EventFeed />
    </div>
  );
}
