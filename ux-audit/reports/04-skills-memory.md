# UX Audit: Skills & Memory Tabs

## Summary

The Skills tab provides a clean read-only list grouped by source, but lacks any interactivity (no search, no enable/disable toggle, no detail view). The Memory tab has a functional search-first design with an add form, but suffers from silent error handling, missing loading/empty state polish, and a timestamp fabrication issue in the data layer. Both tabs are lightweight and functional for a first pass but need interaction affordances and error feedback to be production-ready.

## Issues Found

### Critical (blocks usability)

- **Fabricated timestamps in memory results** -- `lib/openclaw/client.ts:195` -- The `memoryToView` function sets `timestamp: new Date().toISOString()` for every result, meaning every memory item shows the current time rather than its actual creation date. This is actively misleading: users see all memories as "just created" regardless of when they were actually stored. The `MemorySearchDetails` type (`client.ts:182-189`) does not expose a timestamp from the API, so either the API needs to return one or the timestamp column should be hidden entirely.

- **Silent failure on Skills fetch error** -- `skills-tab.tsx:46-48` -- When the skills API call fails, the catch block sets `setSkills([])` with no error feedback. The user sees the "No skills found" empty state, which is indistinguishable from "you have no skills installed." A gateway connectivity problem will appear identical to having zero skills, which could confuse users troubleshooting their setup.

- **Silent failure on Memory search error** -- `memory-tab.tsx:38-39` -- Same problem: a failed memory search silently returns an empty array. The user sees "No memories found" when the real issue might be a gateway timeout or auth failure. There is no way for the user to know something went wrong versus the query genuinely returning no results.

### Major (significant UX friction)

- **No search or filter on Skills tab** -- `skills-tab.tsx:95-161` -- The skills list has no search input, no filter by source, and no filter by enabled/disabled status. If a user has dozens of installed skills, there is no way to locate a specific one quickly. The Memory tab has search; the Skills tab should at minimum have a filter input.

- **No toggle to enable/disable skills** -- `skills-tab.tsx:124-129` -- Each skill shows an "enabled"/"disabled" badge, but there is no toggle or button to change the state. The badge is purely informational with no affordance for interaction. Users see the state but cannot act on it. If toggling is supported by the gateway, this is missing functionality; if not, the badge should at least explain that configuration is done via CLI/config file.

- **Memory search requires explicit action with no browse mode** -- `memory-tab.tsx:27-44, 141-148` -- The Memory tab starts completely empty with "Enter a query to search agent memory." There is no way to browse all memories, see recent memories, or get an overview of what the agent remembers. Users must already know what to search for. A "show recent" or "list all" default would significantly improve discoverability.

- **No delete action for memories** -- `memory-tab.tsx:159-190` -- Memory items are read-only once created. There is no delete button, no edit capability. If a user adds incorrect information via "Add Memory," there is no way to remove it from this UI.

- **Memory "Add" flow gives opaque feedback** -- `memory-tab.tsx:58-63, 108-112` -- After adding a memory, the result message comes from `json.response`, which is the raw gateway response string. This could be anything from a confirmation to a cryptic internal message. There is no structured success/error state, no visual distinction (green for success, red for failure), and the result just appears as gray muted text.

- **No loading indicator for memory search results** -- `memory-tab.tsx:118-139` -- While `loading` state exists and disables the button, there is no skeleton or spinner shown in the results area while a search is in progress. The user clicks "Search," the button changes to "...", and the results area remains unchanged until results arrive. For slow gateway responses, this feels unresponsive.

### Minor (polish/improvement)

- **Skills tab skeleton does not match actual layout** -- `skills-tab.tsx:24-34` -- The loading skeleton shows 4 rectangular blocks, but the actual rendered layout has grouped sections with headers and individual cards per skill. The skeleton does not preview the grouped structure, causing a layout shift when data loads.

- **Memory relevance score display may be confusing** -- `memory-tab.tsx:177-179` -- The relevance score is displayed as "85% match" which looks authoritative, but the underlying value comes from `r.score ?? 0.5` (client.ts:196), meaning any missing score defaults to showing "50% match." Users may interpret this as a meaningful metric when it could be a fallback default.

- **Memory search button label "..." is cryptic** -- `memory-tab.tsx:137` -- During loading, the search button shows `"..."` instead of a proper loading indicator like "Searching..." or a spinner icon. Three dots is ambiguous and looks like a rendering glitch.

- **Skills "ClawHub" link lacks context** -- `skills-tab.tsx:149-159` -- The footer text "Browse and install more skills from ClawHub" is separated from the skills list by a `<Separator>`. This is fine for populated states, but duplicates the same link already shown in the empty state (`skills-tab.tsx:71-78`). If the user has skills, this footer is easy to miss at the bottom.

- **No keyboard shortcut for Memory search** -- `memory-tab.tsx:124-128` -- Enter key triggers search (good), but there is no visual hint that Enter works. Also, the "Add Memory" textarea lacks Enter-to-submit (Cmd+Enter is a common pattern for textarea submission).

- **Memory card expand/collapse has no visual indicator** -- `memory-tab.tsx:162-188` -- Clicking a memory card toggles between `line-clamp-2` and full text, but there is no chevron, arrow, or other visual affordance indicating the card is expandable. The `cursor-pointer` class is the only hint. Users with short memory summaries will not know cards are interactive.

- **No timestamp display on memory results** -- `memory-tab.tsx:159-190` -- The `MemoryItem` type includes a `timestamp` field (`memory-tab.tsx:12`) but it is never rendered in the UI. Even though the timestamp is fabricated (see Critical issue), once real timestamps are available, the UI should display them.

- **Skills tab does not surface `lastUsed` data** -- `types.ts:17` -- The `SkillData` type includes an optional `lastUsed` field, but the Skills tab component ignores it entirely. Showing when a skill was last invoked would help users understand which skills are active versus dormant.

## Recommendations

1. **Fix fabricated timestamps** -- Either request real timestamps from the gateway API's `memory_search` tool, or remove the timestamp field from the view model entirely until real data is available. Do not display fake data.

2. **Add error states to both tabs** -- Distinguish between "no results" and "request failed" with a visible error banner or toast. Show a retry button on failure.

3. **Add a browse/recent mode to Memory** -- On initial load, either fetch recent memories automatically or provide a "Show All" / "Recent" button so users can explore without needing a specific query.

4. **Add search/filter to Skills** -- A simple text filter input at the top of the Skills tab (filtering by name/description) would make the list usable at scale. Optionally add source and enabled/disabled filter toggles.

5. **Add delete capability to Memory** -- Each memory card should have a delete action (trash icon or context menu) to allow users to remove incorrect or outdated memories.

6. **Improve "Add Memory" feedback** -- Show a green success banner or toast on successful save. Show a red error message on failure. Do not rely on raw gateway response text.

7. **Add loading skeletons to Memory search** -- Show 2-3 skeleton cards in the results area while a search is in progress.

8. **Add expand/collapse affordance to memory cards** -- Use a chevron icon or "show more" text to indicate expandability.

9. **Surface `lastUsed` on skills** -- Show a relative timestamp ("2 hours ago") for when each skill was last invoked, helping users understand activity.

10. **Consider enable/disable toggle for skills** -- If the gateway supports it, add a switch control. If not, add a tooltip or note explaining how to toggle skills via CLI.
