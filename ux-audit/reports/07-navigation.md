# UX Audit: Navigation, Dashboard & Overlays

## Summary

The navigation architecture uses a client-side context (`ActiveViewContext`) to switch between chat and dashboard panel views without URL changes, which means dashboard state is not deep-linkable, bookmarkable, or shareable. The Exec Approval Overlay lacks a focus trap, Escape-to-dismiss, and proper ARIA roles, making it inaccessible to keyboard and screen reader users. The sidebar dashboard nav works adequately for mouse users but has no keyboard shortcuts for panel switching, and the dashboard panel header provides no indication of which panel is active.

## Issues Found

### Critical (blocks usability)

- **Exec Approval Overlay has no focus trap** — `components/dashboard/exec-approval-overlay.tsx:64` — When the overlay appears (`fixed inset-0 z-50`), focus is not constrained to the modal. Keyboard users can Tab behind the backdrop into the underlying page. This is an a11y blocker: modal dialogs must trap focus per WAI-ARIA dialog pattern.

- **Exec Approval Overlay has no ARIA dialog role** — `components/dashboard/exec-approval-overlay.tsx:64-65` — The overlay container is a plain `<div>` with no `role="dialog"`, no `aria-modal="true"`, and no `aria-labelledby` pointing to the "Approval Required" heading. Screen readers will not announce this as a modal and users may not realize a blocking dialog has appeared.

- **Exec Approval Overlay cannot be dismissed with Escape** — `components/dashboard/exec-approval-overlay.tsx:18-143` — There is no `onKeyDown` handler for the Escape key. When multiple approval requests stack, users have no keyboard-accessible way to dismiss or triage them without clicking. The overlay also cannot be dismissed by clicking the backdrop; while this may be intentional for safety, there is no visible close/dismiss affordance as an alternative.

- **Dashboard panel state is not reflected in the URL** — `lib/contexts/active-view-context.tsx:36-44` — The active panel is stored in React state only (`useState`). Switching to e.g. "Logs" does not change the URL. This means: (1) browser back/forward does not navigate between panels, (2) refreshing the page resets to chat view, (3) panel links cannot be shared or bookmarked. For a dashboard app where users spend significant time in panel views, this is a major usability gap.

### Major (significant UX friction)

- **No active panel title in the dashboard header** — `components/dashboard-panel-view.tsx:39-41` — The dashboard panel header only contains the sidebar toggle button. There is no heading or title showing which panel is active (e.g., "Logs", "Sessions"). Users must rely on the sidebar highlight state to know where they are, which is invisible when the sidebar is collapsed.

- **MainContentSwitcher auto-resets to chat on any URL change** — `components/main-content-switcher.tsx:17-19` — If the user is viewing a dashboard panel and the URL changes for any reason (e.g., SWR refetch triggers a router refresh, or a chat link is clicked elsewhere), the view snaps back to chat mode. This effect runs on every pathname change, which could be disorienting if the user did not intend to leave the dashboard.

- **Exec Approval Overlay polls on a fixed 3-second interval regardless of visibility** — `components/dashboard/exec-approval-overlay.tsx:33-34` — The overlay polls `/api/openclaw/approvals` every 3 seconds unconditionally, even when no approvals are pending. This wastes network bandwidth and could cause unnecessary re-renders. There is also no visual/audio notification when a new approval appears — the modal just silently materializes, which users may miss if they are focused elsewhere.

- **Delete All Chats button is placed next to New Chat with no visual separation** — `components/app-sidebar.tsx:82-119` — The destructive "Delete All Chats" trash icon button sits immediately adjacent to the "New Chat" plus icon button in the sidebar header, both styled as ghost buttons with the same size. This creates a high risk of accidental clicks on the destructive action. The AlertDialog confirmation helps, but the proximity invites the wrong click in the first place.

### Minor (polish/improvement)

- **No keyboard shortcuts for panel switching** — `components/sidebar-dashboard-nav.tsx:46-59` — Dashboard panels are only reachable by clicking sidebar nav items. There are no keyboard shortcuts (e.g., Ctrl+1 through Ctrl+9) for quick panel switching. The sidebar itself has Cmd+B to toggle, but individual panels have no accelerators.

- **Sidebar dashboard nav is always visible, even for unauthenticated users** — `components/app-sidebar.tsx:124-127` — `SidebarHistory` receives the `user` prop and conditionally renders, but `SidebarDashboardNav` is rendered unconditionally. If there are scenarios where unauthenticated/guest users should not see dashboard panels, this is a gap.

- **SidebarMenuButton uses `onClick` without `type="button"`** — `components/sidebar-dashboard-nav.tsx:48-57` — The `SidebarMenuButton` component renders a `<button>` element, but does not set `type="button"`. In forms or form-adjacent contexts, buttons default to `type="submit"`. While this is unlikely to cause issues in the sidebar, it diverges from the project's own CLAUDE.md rule: "Always include a `type` attribute for button elements."

- **Approval overlay does not handle concurrent resolution gracefully** — `components/dashboard/exec-approval-overlay.tsx:44-56` — The `resolving` state tracks only a single ID (`string | null`). If a user clicks "Allow Once" on one approval and quickly clicks an action on another, the second click will not be disabled because `resolving` only matches one ID at a time.

- **Tooltip content hidden on mobile with `className="hidden md:block"`** — `components/app-sidebar.tsx:95,116` and `components/sidebar-toggle.tsx:30` — Tooltip content uses `hidden md:block`, meaning touch/mobile users never see tooltip text. While tooltips are generally not ideal on touch devices, the information (e.g., "Delete All Chats") is important context that should be conveyed by an `aria-label` on the button itself.

- **DashboardPanelView returns null when no active panel** — `components/dashboard-panel-view.tsx:31-33` — If `activePanel` is null, the component returns `null`. Since `MainContentSwitcher` only renders `DashboardPanelView` when `isDashboard` is true (which requires a non-null panel), this null check is technically unreachable dead code, adding minor cognitive overhead.

## Recommendations

1. **Add URL-based panel state (high priority):** Update `ActiveViewContext` to sync with URL search params (e.g., `?panel=logs`) or use a dedicated route like `/dashboard/logs`. This enables deep linking, bookmarking, browser back/forward, and page refresh persistence. Consider using `useSearchParams` + `router.replace` to avoid full navigation.

2. **Implement proper dialog a11y for the Exec Approval Overlay (high priority):** Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and a focus trap (e.g., `@radix-ui/react-focus-lock` or a custom implementation). Add an Escape key handler. Consider whether clicking the backdrop should dismiss (with the approval remaining in the queue) or if an explicit "Skip" button is more appropriate.

3. **Add an active panel title to the dashboard header:** In `DashboardPanelView`, render the panel name as a heading (e.g., `<h1>`) next to the sidebar toggle. This provides orientation when the sidebar is collapsed and improves screen reader navigation.

4. **Separate the Delete All button from New Chat:** Move the trash icon to the sidebar footer near the user nav, or add visual separation (divider, different color). This reduces accidental destructive clicks.

5. **Optimize approval polling:** Use an exponential backoff or SSE-based notification instead of fixed 3-second polling. At minimum, reduce frequency when no approvals are pending.

6. **Add keyboard shortcuts for dashboard panels:** Map Cmd/Ctrl+1-9 to the panel list for power users who navigate frequently.

7. **Add `type="button"` to SidebarMenuButton usages:** Ensure button elements explicitly declare their type per project conventions.

8. **Add `aria-label` to icon-only buttons:** The trash and plus buttons in the sidebar header should have `aria-label="Delete all chats"` and `aria-label="New chat"` respectively, not just tooltip text.
