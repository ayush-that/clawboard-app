# UX Audit: Logs & Sessions Tabs

## Summary

The Logs tab provides a functional real-time log viewer with level filtering and auto-scroll, but has a broken default filter state, confusing reverse-chronological ordering, and no error feedback to the user. The Sessions tab offers a clean list-to-detail navigation pattern but lacks search/filter, refresh capability, and keyboard navigation for the session list. Both tabs have no visible error states when API calls fail, silently swallowing failures.

## Issues Found

### Critical (blocks usability)

- **Logs filter defaults to "all" but comparison checks for "All" -- filter is broken on initial load** -- `components/dashboard/tabs/logs-tab.tsx:28,65-68` -- The `filter` state is initialized to `"all"` (lowercase) on line 28, but the pass-through condition on line 66 checks `filter === "All"` (capitalized). On first render, this means no logs pass the filter: the lowercase `"all"` does not match `"All"`, so it falls through to `logs.filter((l) => l.level === filter.toLowerCase())`, which tries to match `l.level === "all"` -- a level that does not exist. The user sees an empty log view until they manually click a filter button. This completely breaks the default experience.

- **Logs are fetched sorted newest-first from the API, then reversed again to oldest-first, but auto-scroll scrolls to the bottom** -- `components/dashboard/tabs/logs-tab.tsx:69,31-35` and `lib/openclaw/client.ts:623-628` -- The API returns logs sorted `b.timestamp - a.timestamp` (newest first) and sliced to 100. The component then does `[...filteredLogs].reverse()` on line 69, so `displayLogs` is oldest-first. Auto-scroll jumps to the bottom (newest). This means when auto-scroll is off, the user sees the oldest entries at the top -- which is the conventional log layout. However, when new logs arrive via the 5-second poll, the entire array is replaced and re-reversed, which can cause the scroll position to jump unpredictably if the user was mid-scroll. There is no scroll-position preservation logic.

### Major (significant UX friction)

- **No error state displayed when log or session fetches fail** -- `components/dashboard/tabs/logs-tab.tsx:47-49` and `components/dashboard/tabs/sessions-tab.tsx:97-98` -- Both tabs silently catch errors. The logs tab keeps stale data on failure (line 47-49 comment says "keep existing logs on error"), and the sessions tab sets sessions to an empty array on error (line 98). Neither shows a toast, banner, or inline message. If the gateway is down, the user sees either stale data or an empty state with "No sessions found" -- indistinguishable from a genuinely empty state.

- **Sessions tab has no refresh mechanism** -- `components/dashboard/tabs/sessions-tab.tsx:91-104` -- Sessions are fetched once on mount (line 91-104) with no polling, no pull-to-refresh, and no manual refresh button. If a session starts or ends while the tab is open, the user must navigate away and back. The Logs tab polls every 5 seconds, creating an inconsistency in data freshness across tabs.

- **Session messages view has no scroll container constraint** -- `components/dashboard/tabs/sessions-tab.tsx:130-233` -- The message detail view uses `space-y-3` inside a plain div with no height constraint or overflow scroll. For sessions with many messages, the entire page scrolls, pushing the "Back" button off-screen. This contrasts with the Logs tab which uses `h-[calc(100dvh-theme(spacing.14))]` with `overflow-y-auto` for a contained scroll area.

- **No search or filter on sessions list** -- `components/dashboard/tabs/sessions-tab.tsx:249-291` -- The session list is a flat unfiltered list. There is no way to search by session name, filter by model, or sort by tokens/time. With many sessions, finding a specific one requires scanning the entire list.

- **Log content is hard-truncated at 500 characters with no expand option** -- `components/dashboard/tabs/logs-tab.tsx:152-154` and `lib/openclaw/client.ts:600,609` -- Content is sliced to 500 characters on the client (line 152-154) and also pre-sliced on the server (text at 500, thinking at 300 in client.ts lines 600, 609). There is no "show more" or detail modal. Long log entries are permanently truncated with just `...` appended, with no way to see the full content.

- **Logs are capped at 100 entries with no pagination or "load more"** -- `lib/openclaw/client.ts:628` -- The server slices to the most recent 100 logs. There is no pagination, cursor, or "load older" mechanism. Users cannot access historical logs beyond the latest 100.

### Minor (polish/improvement)

- **Logs timestamp shows time-only with no date context** -- `components/dashboard/tabs/logs-tab.tsx:138-143` -- Timestamps use `toLocaleTimeString` showing only HH:MM:SS. If logs span multiple days (or if the user opens the tab the next morning), there is no date indicator. A relative timestamp or date separator would help.

- **Session messages show absolute time but session list shows relative time** -- `components/dashboard/tabs/sessions-tab.tsx:204-210` vs `sessions-tab.tsx:285` -- The session list card shows "5m ago" style relative time (line 285), but the message detail view shows `toLocaleTimeString` absolute time (lines 204-210). This inconsistency can be disorienting when correlating timeframes.

- **Auto-scroll checkbox uses a native `<input type="checkbox">` without matching design system** -- `components/dashboard/tabs/logs-tab.tsx:109-118` -- The auto-scroll toggle uses a raw HTML checkbox with `accent-primary` styling, while the rest of the UI uses shadcn/ui components. This creates a visual inconsistency. A `Switch` or `Checkbox` component from the design system would look more polished.

- **Session list cards don't indicate message count** -- `components/dashboard/tabs/sessions-tab.tsx:253-289` -- Each session card shows model, tokens, and time ago, but not how many messages are in the session. This would help users gauge session size before clicking in.

- **Log entry key is constructed from content substring which could collide** -- `components/dashboard/tabs/logs-tab.tsx:135` -- The React key is `${entry.timestamp}-${entry.source}-${entry.content.slice(0, 20)}`. If two log entries from the same source have the same timestamp and same first 20 characters, the keys collide. Adding an index suffix or using a hash would be safer.

- **Session messages lack a scroll-to-bottom shortcut** -- `components/dashboard/tabs/sessions-tab.tsx:180-230` -- Long message threads have no "jump to latest" button, unlike the Logs tab which has auto-scroll.

- **Logs empty state message is vague when filtered** -- `components/dashboard/tabs/logs-tab.tsx:127-130` -- The empty state always says "No log entries" regardless of whether a filter is active. It should distinguish between "No logs at all" and "No logs matching this filter" to avoid confusion.

## Recommendations

1. **[P0] Fix the default filter bug** -- Change line 28 of `logs-tab.tsx` from `useState<string>("all")` to `useState<string>("All")` to match the comparison on line 66. This is a one-character fix that unblocks the entire Logs tab.

2. **[P1] Add error states to both tabs** -- Display an inline error banner (e.g., "Failed to connect to gateway") when fetch calls fail, with a retry button. Distinguish between "no data" and "fetch failed" states.

3. **[P1] Add a refresh button and/or polling to Sessions tab** -- Either add a manual "Refresh" button in the header, or add a polling interval (e.g., 30 seconds) to match the Logs tab's behavior.

4. **[P1] Constrain the session messages view height** -- Wrap the message list in a scrollable container with the same `h-[calc(100dvh-theme(spacing.14))]` pattern used in the Logs tab, keeping the Back button always visible.

5. **[P2] Add search/filter to sessions list** -- A text input filtering by display name or model would significantly improve usability for users with many sessions.

6. **[P2] Add expand/collapse for long log entries** -- Allow users to click a truncated log entry to see the full content, or provide a detail panel.

7. **[P2] Preserve scroll position on log refresh** -- When auto-scroll is off, save and restore `scrollTop` after data refresh so the user's position is not lost.

8. **[P3] Replace native checkbox with design system component** -- Swap the auto-scroll checkbox for a `Switch` or `Checkbox` from shadcn/ui.

9. **[P3] Improve timestamp clarity** -- Add date indicators or relative timestamps to logs. Unify timestamp format between session list and message detail views.

10. **[P3] Show message count on session cards** -- Add a "N messages" indicator to each session card for at-a-glance information.
