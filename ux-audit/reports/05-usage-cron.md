# UX Audit: Usage & Cron Tabs

## Summary

The Usage tab provides a clean summary-card layout with token and cost data, but lacks data visualization beyond plain tables and omits the model breakdown data it fetches. The Cron tab has solid CRUD flows with inline editing, but has critical accessibility problems with its custom toggle switch, no delete confirmation, and silent error handling that leaves users in the dark when mutations fail.

## Issues Found

### Critical (blocks usability)

- **Custom toggle switch is not keyboard accessible** — `components/dashboard/tabs/cron-tab.tsx:257-268` — The enable/disable toggle is a raw `<button>` with custom CSS mimicking a switch, but it has no `role="switch"`, no `aria-checked` attribute, and no visible focus ring. Screen reader users cannot determine the toggle's state, and keyboard users get no focus feedback. This should use `role="switch"` with `aria-checked={job.enabled}` and a focus-visible outline, or be replaced with a proper accessible Switch component.

- **Delete has no confirmation** — `components/dashboard/tabs/cron-tab.tsx:304-306` — Clicking the delete button immediately removes the cron job with no confirmation dialog. Accidental deletion is unrecoverable. This is especially dangerous on mobile where tap targets are small and close to the edit button.

- **Silent error swallowing on all mutations** — `components/dashboard/tabs/cron-tab.tsx:86-97, 114-125` — `handleToggle` and `handleDelete` catch errors silently with `// silent fail`. If the gateway is down or returns an error, the user gets zero feedback. The toggle will appear to do nothing, and delete will appear to succeed (no re-fetch on error path). Users will be confused about whether their action worked.

### Major (significant UX friction)

- **Model breakdown data is fetched but never displayed** — `components/dashboard/tabs/usage-tab.tsx:33-34` — The `UsageSummary` type includes `modelBreakdown: ModelBreakdown[]` and it is computed server-side (`lib/openclaw/client.ts:529-543`), but the Usage tab never renders it. This is useful data (cost per model) that is wasted. Either display it or stop computing it.

- **Daily costs table key collisions** — `components/dashboard/tabs/usage-tab.tsx:165` — The daily costs table uses `d.date` as the React key, but multiple rows can share the same date (different models on the same day). This will cause React reconciliation bugs: rows may not update correctly or may render stale data.

- **No error feedback for create/update in Cron** — `components/dashboard/tabs/cron-tab.tsx:67-84, 99-112` — `handleCreate` and `handleUpdate` do not check `res.ok` or inspect the response status. If the POST/PATCH returns a 500 error, the form closes and re-fetches as if it succeeded. The user thinks the job was created/updated, but it was not.

- **Usage tab has no refresh mechanism** — `components/dashboard/tabs/usage-tab.tsx:84-97` — Data is fetched once on mount with no way to refresh. If a user leaves the tab open and comes back, they see stale data. There is no refresh button, no polling, and no re-fetch on tab focus. The Cron tab at least re-fetches after mutations.

- **Usage API route returns no error status on failure** — `app/api/openclaw/usage/route.ts:5-9` — The GET handler does not wrap in try/catch. If `getUsageSummary` throws, the route returns an unhandled error. Meanwhile the client (`usage-tab.tsx:88`) casts the response to `UsageSummary` without checking `res.ok`, so a 500 response with an error body would be silently accepted as corrupt data.

- **Summary cards grid breaks on small screens** — `components/dashboard/tabs/usage-tab.tsx:122` — `grid-cols-3` is hardcoded with no responsive breakpoint. On narrow mobile viewports (<375px), three columns become cramped and text overflows. Should use `grid-cols-1 sm:grid-cols-3` or similar.

### Minor (polish/improvement)

- **Cron schedule input has no validation or help** — `components/dashboard/tabs/cron-tab.tsx:170-177` — The schedule input placeholder says `*/5 * * * * or every 30m` but there is no validation. Invalid cron expressions are sent to the gateway, which may silently fail or error. A simple regex check or tooltip explaining the format would prevent user confusion.

- **Last/Next run times show only time, not date** — `components/dashboard/tabs/cron-tab.tsx:333-350` — `toLocaleTimeString` with `hour:2-digit, minute:2-digit` omits the date entirely. If a job last ran yesterday, "14:30" is misleading. Should include at least a short date for runs older than today.

- **Daily costs table has no sorting** — `components/dashboard/tabs/usage-tab.tsx:154-178` — The daily breakdown table renders rows in whatever order the API returns them. Users cannot sort by date, cost, tokens, or model. For any non-trivial amount of data this makes it hard to find the most expensive days.

- **Cost formatting uses 4 decimal places everywhere** — `components/dashboard/tabs/usage-tab.tsx:135, 168` — `toFixed(4)` produces values like `$0.0023` which is fine, but also `$14.2300` which looks odd. Consider trimming trailing zeros or using fewer decimals for larger values.

- **No empty state differentiation for "no data yet" vs "error"** — `components/dashboard/tabs/usage-tab.tsx:103-115` — When `data` is null, the message is "Unable to fetch usage data". But `data` is also null when the gateway returns an empty/zeroed summary (the catch block in `getUsageSummary` returns zeroed data, not null, so this is only for network errors). The message is accurate but could be more helpful with a retry action.

- **Cron job card layout density** — `components/dashboard/tabs/cron-tab.tsx:207-356` — Each job is a full `<Card>` with generous padding. With many jobs (10+), the list becomes very long. Consider a more compact list view or virtualization for scalability.

- **Edit form inputs have no labels** — `components/dashboard/tabs/cron-tab.tsx:212-231` — Both the create form and edit form use `<Input>` and `<Textarea>` without associated `<label>` elements. The create form has placeholders as pseudo-labels, but the edit form has no placeholders at all. Screen readers will announce these as unlabeled inputs.

- **No loading indicator on toggle** — `components/dashboard/tabs/cron-tab.tsx:86-97` — When toggling a cron job's enabled state, there is no visual feedback that the action is in progress. The toggle updates only after the re-fetch completes. With a slow gateway, the user may click multiple times.

## Recommendations

1. **[Critical]** Replace the custom toggle with an accessible Switch component (e.g., from shadcn/ui or Radix). Add `role="switch"`, `aria-checked`, and focus-visible styles.
2. **[Critical]** Add a confirmation dialog before deleting cron jobs. A simple `window.confirm()` or a modal would prevent accidental data loss.
3. **[Critical]** Show error toasts/banners when toggle, delete, create, or update operations fail instead of swallowing errors silently.
4. **[Major]** Render the model breakdown data in the Usage tab -- it is already computed. A simple table or bar chart showing cost-per-model would add significant value.
5. **[Major]** Fix the daily costs table key to use `${d.date}-${d.model}` to avoid React key collisions.
6. **[Major]** Check `res.ok` in all fetch calls before parsing the response as success data. Show user-facing errors when the API returns non-200 status.
7. **[Major]** Add a refresh button to the Usage tab header. Consider re-fetching on tab visibility change.
8. **[Major]** Wrap the Usage API route in try/catch and return a proper error response with status 500.
9. **[Major]** Make the summary cards grid responsive: `grid-cols-1 sm:grid-cols-3`.
10. **[Minor]** Add `<label>` elements to all form inputs in the Cron tab for accessibility.
11. **[Minor]** Include date context in last/next run timestamps for cron jobs.
12. **[Minor]** Add basic cron expression validation or a helper tooltip to the schedule input.
13. **[Minor]** Add optimistic UI or a spinner to the toggle switch during the async operation.
