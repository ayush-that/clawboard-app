"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { SidebarDashboardNav } from "@/components/sidebar/sidebar-dashboard-nav";
import {
  getChatHistoryPaginationKey,
  SidebarHistory,
} from "@/components/sidebar/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { useActiveView } from "@/lib/contexts/active-view-context";
import { PlusIcon, TrashIcon } from "@/lib/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { setChat } = useActiveView();
  const { mutate } = useSWRConfig();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const handleDeleteAll = () => {
    const deletePromise = fetch("/api/history", {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting all chats...",
      success: () => {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
        setShowDeleteAllDialog(false);
        router.replace("/");
        router.refresh();
        return "All chats deleted successfully";
      },
      error: "Failed to delete all chats",
    });
  };

  return (
    <>
      <Sidebar className="group-data-[side=left]:border-r-0">
        <SidebarHeader className="border-b border-sidebar-accent">
          <SidebarMenu>
            <div className="flex flex-row items-center justify-between py-1">
              <Link
                className="flex flex-row items-center gap-1.5"
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                  setChat();
                }}
              >
                <Image
                  alt=""
                  className="size-6"
                  height={24}
                  src="/favicon-32x32.png"
                  unoptimized
                  width={24}
                />
                <span
                  className="cursor-pointer rounded-md pr-2 text-lg font-semibold hover:bg-muted"
                  style={{ fontFamily: "var(--font-geist-pixel-square)" }}
                >
                  ClawBoard
                </span>
              </Link>
              <div className="flex flex-row gap-0.5">
                {user && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="size-8 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent"
                        onClick={() => setShowDeleteAllDialog(true)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <TrashIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent align="end" className="hidden md:block">
                      Delete All Chats
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="size-8 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent"
                      onClick={() => {
                        setOpenMobile(false);
                        router.push("/");
                        router.refresh();
                      }}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <PlusIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="end" className="hidden md:block">
                    New Chat
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarHistory user={user} />
          <SidebarDashboardNav />
        </SidebarContent>
        <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
      </Sidebar>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your chats and remove them from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
