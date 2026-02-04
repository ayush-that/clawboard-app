# UX Audit Triage -- Master Plan

## Executive Summary

Across 7 audit reports covering chat, auth, dashboard tabs, navigation, and overlays, there are approximately 55 distinct issues identified: 12 critical, 22 major, and 21 minor. The most pervasive problems are: (1) silent error swallowing across nearly every dashboard tab, leaving users unable to distinguish "no data" from "gateway down"; (2) accessibility gaps in the Exec Approval Overlay and Cron toggle that block keyboard/screen-reader users; (3) a broken default log filter that renders the Logs tab empty on first load; and (4) missing URL-based dashboard state, meaning panels cannot be bookmarked or survive a page refresh. The codebase is functionally solid but needs a focused pass on error feedback, accessibility, and a few data-correctness bugs.

## Fix Plan -- Ordered by Priority

### Batch 1: Critical Fixes (must fix)

- **1.1: Fix Logs default filter bug (one-line fix)**
  - Files: `components/dashboard/tabs/logs-tab.tsx`
  - Issues: Report 03 -- filter initialized to `"all"` but comparison checks `"All"`, so no logs display on initial load
  - What to do:
    - Change `useState<string>("all")` to `useState<string>("All")` on line 28

- **1.2: Fix Config tab save flow (stale hash + soul/model clearing)**
  - Files: `components/dashboard/tabs/config-tab.tsx`
  - Issues: Report 06 -- config not re-fetched after save (stale hash breaks subsequent saves); clearing soul or model text is silently ignored
  - What to do:
    - After successful PATCH in `handleSave`, re-fetch the config (mirror the pattern in channels-tab `fetchChannels()`)
    - Change the change-detection logic to compare current values against original fetched values, not just check truthiness. Track original `model` and `soulMd` values so clearing a field is detected as a real change
    - Fix the "No changes to save" message to use neutral styling instead of success green

- **1.3: Fix Exec Approval Overlay accessibility**
  - Files: `components/dashboard/exec-approval-overlay.tsx`
  - Issues: Report 07 -- no `role="dialog"`, no `aria-modal`, no focus trap, no Escape key dismissal
  - What to do:
    - Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the "Approval Required" heading
    - Add an `onKeyDown` handler for Escape key (dismiss/skip current approval)
    - Add a focus trap so Tab does not leave the overlay (use Radix focus-lock or a manual implementation)

- **1.4: Fix dark-mode toast visibility**
  - Files: `components/toast.tsx`
  - Issues: Report 02 -- toast background is hardcoded `bg-zinc-100`/`text-zinc-950` with no dark variants; all auth error feedback is invisible in dark mode
  - What to do:
    - Add dark-mode Tailwind classes: `dark:bg-zinc-800 dark:text-zinc-50` (or use theme tokens like `bg-background text-foreground`)

- **1.5: Fix Cron tab toggle accessibility + add delete confirmation**
  - Files: `components/dashboard/tabs/cron-tab.tsx`
  - Issues: Report 05 -- custom toggle has no `role="switch"`, no `aria-checked`, no focus ring; delete has no confirmation dialog
  - What to do:
    - Replace the custom toggle button with `role="switch"`, `aria-checked={job.enabled}`, and add `focus-visible:ring-2` styling, OR replace with a shadcn/ui Switch component
    - Wrap the delete action in a confirmation dialog (use existing AlertDialog pattern from `app-sidebar.tsx`)

- **1.6: Remove fabricated memory timestamps**
  - Files: `lib/openclaw/client.ts`
  - Issues: Report 04 -- `memoryToView` sets `timestamp: new Date().toISOString()` for every result, showing all memories as "just created"
  - What to do:
    - Remove the fabricated timestamp from `memoryToView`
    - Either pass through the real timestamp from the API if available, or remove the timestamp field from the view model and stop rendering it

### Batch 2: Major Fixes (should fix)

- **2.1: Add error feedback across all dashboard tabs (silent error swallowing)**
  - Files: `components/dashboard/tabs/logs-tab.tsx`, `components/dashboard/tabs/sessions-tab.tsx`, `components/dashboard/tabs/skills-tab.tsx`, `components/dashboard/tabs/memory-tab.tsx`, `components/dashboard/tabs/usage-tab.tsx`, `components/dashboard/tabs/cron-tab.tsx`, `components/dashboard/tabs/channels-tab.tsx`
  - Issues: Reports 03, 04, 05, 06 -- every tab silently catches errors with no user feedback; "no data" is indistinguishable from "gateway down"
  - What to do:
    - Add an `error` state (`string | null`) to each tab component
    - On fetch failure, set the error state with a user-facing message (e.g., "Failed to connect to gateway")
    - Render an inline error banner with a "Retry" button when error state is set
    - Clear error state on successful fetch
    - In Cron tab specifically: check `res.ok` on create/update/toggle/delete before treating as success

- **2.2: Add dashboard panel title + URL-based panel state**
  - Files: `components/dashboard-panel-view.tsx`, `lib/contexts/active-view-context.tsx`, `components/main-content-switcher.tsx`
  - Issues: Report 07 -- no active panel title in header; dashboard state not in URL (no deep linking, no bookmark, refresh resets to chat)
  - What to do:
    - In `DashboardPanelView`, render the active panel name as a heading next to the sidebar toggle
    - Update `ActiveViewContext` to sync panel state with URL search params (e.g., `?panel=logs`) using `useSearchParams` + `router.replace`
    - Update `MainContentSwitcher` to read panel from URL on mount instead of always resetting to chat

- **2.3: Fix chat page Suspense fallbacks + readonly chat empty bar**
  - Files: `app/(chat)/page.tsx`, `app/(chat)/chat/[id]/page.tsx`, `components/chat.tsx`
  - Issues: Report 01 -- empty Suspense fallback shows blank page; readonly chat shows empty input bar
  - What to do:
    - Replace empty `<div className="flex h-dvh" />` fallbacks with a skeleton UI (header bar, message area placeholder, input box outline)
    - Move the `isReadonly` conditional to wrap the entire sticky bottom div, not just the `MultimodalInput` inside it

- **2.4: Fix Sessions tab scroll + add refresh**
  - Files: `components/dashboard/tabs/sessions-tab.tsx`
  - Issues: Report 03 -- session messages view has no scroll container (page scrolls, Back button goes off-screen); no refresh mechanism
  - What to do:
    - Wrap the message detail view in a scrollable container with `h-[calc(100dvh-theme(spacing.14))] overflow-y-auto`, matching the Logs tab pattern
    - Add a manual refresh button in the sessions tab header
    - Optionally add polling (30s interval)

- **2.5: Fix Usage tab responsive grid + daily costs key collision + add refresh**
  - Files: `components/dashboard/tabs/usage-tab.tsx`, `app/api/openclaw/usage/route.ts`
  - Issues: Report 05 -- summary cards `grid-cols-3` is not responsive; daily costs table uses `d.date` as key (collides when multiple models on same date); no refresh; API route has no try/catch
  - What to do:
    - Change `grid-cols-3` to `grid-cols-1 sm:grid-cols-3`
    - Change daily costs key from `d.date` to `${d.date}-${d.model}`
    - Add a refresh button to the Usage tab header
    - Wrap the Usage API route in try/catch with proper error response

- **2.6: Fix chat textarea auto-resize + mobile attachment removal**
  - Files: `components/multimodal-input.tsx`, `components/preview-attachment.tsx`
  - Issues: Report 01 -- textarea height is hardcoded to 44px and never auto-resizes; attachment remove button is hover-only (invisible on touch devices)
  - What to do:
    - Either remove `disableAutoResize={true}` from `PromptInputTextarea`, or fix `adjustHeight` to read `scrollHeight` and set height dynamically (capped at ~200px)
    - Make the attachment remove button always visible (remove `opacity-0 group-hover:opacity-100`) or add touch-friendly alternative (e.g., always visible small X)

- **2.7: Add password requirements to register + fix auth error messages**
  - Files: `components/auth-form.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
  - Issues: Report 02 -- no visible password requirements on register; validation errors show "Failed validating your submission!" (unhelpful); no `autoComplete` attribute on password
  - What to do:
    - Add hint text below the password field on register: "Must be at least 6 characters"
    - Add `minLength={6}` to the password input on register
    - Add `autoComplete="current-password"` on login, `autoComplete="new-password"` on register
    - Replace the generic "Failed validating your submission!" with specific per-field messages

### Batch 3: Minor Fixes (nice to have -- skip for now)

- Hardcoded `#006cff` user message bubble color (Report 01)
- Visibility selector hidden on mobile (Report 01)
- No error recovery/retry UI for chat stream failures (Report 01)
- No file accept attribute on file input (Report 01)
- Stop button only shows during "submitted", not "streaming" (Report 01)
- Greeting uses hardcoded `text-zinc-500` (Report 01)
- Chat 404 redirect with no explanation (Report 01)
- Auth heading level skip (`h3` with no `h1`) (Report 02)
- Auth `useEffect` toast suppression on duplicate status (Report 02)
- Guest auth endpoint has no loading/error UX (Report 02)
- Logs timestamp shows time-only with no date (Report 03)
- Auto-scroll checkbox uses native input instead of design system (Report 03)
- Log entry key collision potential (Report 03)
- Skills tab skeleton does not match layout (Report 04)
- Memory relevance score "50% match" default is misleading (Report 04)
- Memory card expand/collapse has no visual indicator (Report 04)
- Skills `lastUsed` field not surfaced (Report 04)
- Cron schedule input has no validation help (Report 05)
- Cron last/next run times show only time, not date (Report 05)
- Cost formatting trailing zeros (Report 05)
- Cron/Config/Settings form inputs lack `<label>` elements (Reports 05, 06)
- Save feedback messages never auto-clear (Report 06)
- Config model field is free-text with no suggestions (Report 06)
- Channels textarea fixed 10 rows (Report 06)
- Settings secrets returned in plaintext in GET response (Report 06)
- No keyboard shortcuts for panel switching (Report 07)
- `SidebarMenuButton` missing `type="button"` (Report 07)
- Delete All Chats button proximity to New Chat (Report 07)
- Approval overlay polls unconditionally every 3s (Report 07)
- Tooltip content hidden on mobile (Report 07)

## Agent Assignments

Proposed split across 4 fix agents, grouped by files touched to minimize merge conflicts:

**Agent A: Dashboard Tabs -- Error Feedback + Data Fixes**
- Work Item 1.1 (Logs filter bug)
- Work Item 1.6 (Fabricated memory timestamps)
- Work Item 2.1 (Error feedback across all dashboard tabs)
- Work Item 2.4 (Sessions scroll + refresh)
- Work Item 2.5 (Usage responsive grid + key collision + refresh + API error handling)
- Files touched: `components/dashboard/tabs/logs-tab.tsx`, `sessions-tab.tsx`, `skills-tab.tsx`, `memory-tab.tsx`, `usage-tab.tsx`, `cron-tab.tsx`, `channels-tab.tsx`, `lib/openclaw/client.ts`, `app/api/openclaw/usage/route.ts`

**Agent B: Config + Cron Tab Fixes**
- Work Item 1.2 (Config save flow + soul/model clearing)
- Work Item 1.5 (Cron toggle a11y + delete confirmation)
- Files touched: `components/dashboard/tabs/config-tab.tsx`, `components/dashboard/tabs/cron-tab.tsx`

**Agent C: Navigation, Overlays + Dashboard Shell**
- Work Item 1.3 (Exec Approval Overlay a11y)
- Work Item 2.2 (Panel title + URL-based panel state)
- Files touched: `components/dashboard/exec-approval-overlay.tsx`, `components/dashboard-panel-view.tsx`, `lib/contexts/active-view-context.tsx`, `components/main-content-switcher.tsx`

**Agent D: Chat Pages + Auth**
- Work Item 1.4 (Dark-mode toast)
- Work Item 2.3 (Suspense fallbacks + readonly chat empty bar)
- Work Item 2.6 (Textarea auto-resize + mobile attachment removal)
- Work Item 2.7 (Password requirements + auth error messages)
- Files touched: `components/toast.tsx`, `app/(chat)/page.tsx`, `app/(chat)/chat/[id]/page.tsx`, `components/chat.tsx`, `components/multimodal-input.tsx`, `components/preview-attachment.tsx`, `components/auth-form.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
