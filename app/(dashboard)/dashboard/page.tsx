"use client";

import { EventFeed } from "@/components/dashboard/event-feed";
import { CronTab } from "@/components/dashboard/tabs/cron-tab";
import { MemoryTab } from "@/components/dashboard/tabs/memory-tab";
import { SessionsTab } from "@/components/dashboard/tabs/sessions-tab";
import { StatusTab } from "@/components/dashboard/tabs/status-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  return (
    <div className="flex h-dvh flex-col bg-background">
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
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="cron">Cron</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>
        </div>

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <TabsContent className="flex-1" value="status">
            <StatusTab />
          </TabsContent>
          <TabsContent className="flex-1" value="sessions">
            <SessionsTab />
          </TabsContent>
          <TabsContent className="flex-1" value="cron">
            <CronTab />
          </TabsContent>
          <TabsContent className="flex-1" value="memory">
            <MemoryTab />
          </TabsContent>
        </main>
      </Tabs>

      {/* Event feed */}
      <EventFeed />
    </div>
  );
}
