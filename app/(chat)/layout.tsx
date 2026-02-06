import { cookies } from "next/headers";
import Script from "next/script";
import { Suspense } from "react";
import { ExecApprovalOverlay } from "@/components/dashboard/exec-approval-overlay";
import { MainContentSwitcher } from "@/components/dashboard/main-content-switcher";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { TamboWrapper } from "@/components/tambo-wrapper";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ActiveViewProvider } from "@/lib/contexts/active-view-context";
import { getUserSettings } from "@/lib/db/queries";
import { auth } from "../(auth)/auth";

function LayoutSkeleton() {
  return (
    <div className="flex h-dvh">
      <div className="hidden w-[var(--sidebar-width)] shrink-0 border-r border-border bg-sidebar md:block">
        <div className="flex flex-col gap-4 p-4">
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
          <div className="space-y-2">
            <div className="h-6 w-full animate-pulse rounded bg-muted" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-6 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="flex-1" />
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="lazyOnload"
      />
      <DataStreamProvider>
        <Suspense fallback={<LayoutSkeleton />}>
          <SidebarWrapper>{children}</SidebarWrapper>
        </Suspense>
      </DataStreamProvider>
    </>
  );
}

async function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

  let tamboApiKey: string | undefined;
  if (session?.user?.id) {
    try {
      const settings = await getUserSettings(session.user.id);
      tamboApiKey = settings?.tamboApiKey ?? undefined;
    } catch {
      tamboApiKey = undefined;
    }
  }

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <TamboWrapper apiKey={tamboApiKey}>
        <ActiveViewProvider>
          <AppSidebar user={session?.user} />
          <SidebarInset>
            <MainContentSwitcher>{children}</MainContentSwitcher>
          </SidebarInset>
          <ExecApprovalOverlay />
        </ActiveViewProvider>
      </TamboWrapper>
    </SidebarProvider>
  );
}
