import { cookies } from "next/headers";
import Script from "next/script";
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ExecApprovalOverlay } from "@/components/dashboard/exec-approval-overlay";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { MainContentSwitcher } from "@/components/main-content-switcher";
import { TamboWrapper } from "@/components/tambo-wrapper";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ActiveViewProvider } from "@/lib/contexts/active-view-context";
import { getUserSettings } from "@/lib/db/queries";
import { auth } from "../(auth)/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <DataStreamProvider>
        <Suspense fallback={<div className="flex h-dvh" />}>
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
      // fall through to env var default
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
