"use client";

import type { PanelName } from "@/lib/contexts/active-view-context";
import { useActiveView } from "@/lib/contexts/active-view-context";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

const navItems: Array<{ name: PanelName; label: string; icon: string }> = [
  { name: "status", label: "Status", icon: "S" },
  { name: "tasks", label: "Tasks", icon: "T" },
  { name: "sessions", label: "Sessions", icon: "H" },
  { name: "logs", label: "Logs", icon: "L" },
  { name: "cron", label: "Cron", icon: "C" },
  { name: "memory", label: "Memory", icon: "M" },
  { name: "skills", label: "Skills", icon: "K" },
  { name: "usage", label: "Usage", icon: "U" },
  { name: "channels", label: "Channels", icon: "N" },
  { name: "config", label: "Config", icon: "G" },
  { name: "debug", label: "Debug", icon: "D" },
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
                <span className="font-mono text-xs">{item.icon}</span>
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
