"use client";

import type { ReactNode } from "react";
import type { PanelName } from "@/lib/contexts/active-view-context";
import { useActiveView } from "@/lib/contexts/active-view-context";
import {
  CheckCircleFillIcon,
  CodeIcon,
  CpuIcon,
  LineChartIcon,
  LogsIcon,
  MessageIcon,
  PencilEditIcon,
  RouteIcon,
  SparklesIcon,
  TerminalIcon,
  TerminalWindowIcon,
} from "./icons";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

const navItems: Array<{ name: PanelName; label: string; icon: ReactNode }> = [
  { name: "status", label: "Status", icon: <CpuIcon size={16} /> },
  { name: "tasks", label: "Tasks", icon: <CheckCircleFillIcon size={16} /> },
  { name: "sessions", label: "Sessions", icon: <MessageIcon size={16} /> },
  { name: "logs", label: "Logs", icon: <LogsIcon size={16} /> },
  { name: "cron", label: "Cron", icon: <TerminalIcon size={16} /> },
  { name: "memory", label: "Memory", icon: <SparklesIcon size={16} /> },
  { name: "skills", label: "Skills", icon: <CodeIcon size={16} /> },
  { name: "usage", label: "Usage", icon: <LineChartIcon size={16} /> },
  { name: "channels", label: "Channels", icon: <RouteIcon size={16} /> },
  { name: "config", label: "Config", icon: <PencilEditIcon size={16} /> },
  { name: "debug", label: "Debug", icon: <TerminalWindowIcon size={16} /> },
];

export const SidebarDashboardNav = () => {
  const { activePanel, setPanel } = useActiveView();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                isActive={activePanel === item.name}
                onClick={() => {
                  setPanel(item.name);
                }}
                tooltip={item.label}
              >
                {item.icon}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
