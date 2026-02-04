"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  ChartLine,
  ChatCircle,
  Code,
  Gear,
  ListDashes,
  Path,
  PencilSimple,
  Sparkle,
  Terminal,
} from "@phosphor-icons/react";
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

const navItems: Array<{ name: PanelName; label: string; icon: Icon }> = [
  { name: "sessions", label: "Sessions", icon: ChatCircle },
  { name: "logs", label: "Logs", icon: ListDashes },
  { name: "cron", label: "Cron", icon: Terminal },
  { name: "memory", label: "Memory", icon: Sparkle },
  { name: "skills", label: "Skills", icon: Code },
  { name: "usage", label: "Usage", icon: ChartLine },
  { name: "channels", label: "Channels", icon: Path },
  { name: "config", label: "Config", icon: PencilSimple },
  { name: "settings", label: "Settings", icon: Gear },
];

export const SidebarDashboardNav = () => {
  const { activePanel, setPanel } = useActiveView();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = activePanel === item.name;
            const IconComponent = item.icon;
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => {
                    setPanel(item.name);
                  }}
                  tooltip={item.label}
                >
                  <IconComponent
                    className={isActive ? "text-sidebar-primary" : ""}
                    size={16}
                    weight={isActive ? "fill" : "regular"}
                  />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
