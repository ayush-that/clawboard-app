# UX Audit: Channels, Config & Settings Tabs

## Summary

The Channels, Config, and Settings tabs provide core administrative controls for the ClawBoard dashboard. The Channels tab uses a raw JSON textarea editor which is error-prone and lacks validation feedback. The Config tab has a stale-data problem after saving and its soul/model change detection is unreliable. The Settings tab is the most polished of the three, with clear field descriptions, but all three share a pattern of ephemeral save feedback that can be missed, no dirty-state tracking, and no discard/undo flow.

## Issues Found

### Critical (blocks usability)

- **JSON parse errors silently produce bad UX in Channels editor** -- `components/dashboard/tabs/channels-tab.tsx:99` -- `JSON.parse(editJson)` is called inside `handleSave` with no pre-validation. If the user types invalid JSON, the catch block at line 115 shows a raw JavaScript error string (e.g. `"Error: SyntaxError: Unexpected token..."`) instead of a human-readable message like "Invalid JSON at line 3". Users editing raw JSON in a plain textarea have no syntax highlighting, no line numbers, and no inline error markers, making it extremely difficult to spot mistakes in complex channel settings.

- **Config tab does not refresh its local state after a successful save** -- `components/dashboard/tabs/config-tab.tsx:94-95` -- After `handleSave` succeeds (line 94), the component displays a success message but never re-fetches the config. This means `config.hash` (line 91) becomes stale immediately. If the user makes a second edit and saves again, the PATCH will send the old hash, which will fail the optimistic locking check on the gateway. The Channels tab correctly calls `fetchChannels()` after save (line 111), but Config does not have an equivalent re-fetch.

- **Config change detection misses soul clearing** -- `components/dashboard/tabs/config-tab.tsx:78-79` -- The `handleSave` function only includes `soul` in the patch if `soulMd` is truthy (line 78: `if (soulMd)`). This means a user who clears the SOUL.md textarea entirely and clicks "Save Changes" will get "No changes to save" because both the model check (line 74) and the soul check (line 78) fail. There is no way for the user to delete their agent personality once it has been set.

### Major (significant UX friction)

- **No dirty-state tracking or unsaved-changes warning on any tab** -- All three tabs (`channels-tab.tsx`, `config-tab.tsx`, `settings-tab.tsx`) -- Users can edit fields and then navigate to another dashboard tab, losing all changes without any warning. There is no visual indicator (e.g. dot on the tab, changed button color) that unsaved changes exist. This is especially painful for the Config SOUL.md textarea where users may write multi-paragraph content.

- **Save feedback message is ephemeral only by navigation, never auto-clears** -- `components/dashboard/tabs/config-tab.tsx:131-137`, `settings-tab.tsx:87-93`, `channels-tab.tsx:219-229` -- The `saveResult` string persists indefinitely until the user navigates away or triggers another save. A stale "Saved successfully" message from 10 minutes ago gives no useful signal. Conversely, a stale error message may confuse users who have since fixed the issue. The feedback should auto-clear after a few seconds.

- **Config model field is a free-text input with no validation or suggestions** -- `components/dashboard/tabs/config-tab.tsx:148-154` -- The model field is a plain `<Input>` with a placeholder hint. Users must know the exact model identifier string (e.g. `anthropic/claude-opus-4-6`). There is no dropdown, autocomplete, or validation. An incorrect model string silently breaks the agent. The app already has model definitions in `lib/ai/models.ts` that could inform a selection UI.

- **Config model change detection is fragile** -- `components/dashboard/tabs/config-tab.tsx:74` -- The condition `model && model !== config.agent?.model` means if the user clears the model field (setting it to empty string), the change is silently ignored because `model` is falsy. The user cannot clear the model to revert to the default.

- **Channels tab overwrites entire channel settings object, not a merge** -- `components/dashboard/tabs/channels-tab.tsx:99` and `lib/openclaw/client.ts:700` -- When saving, the full JSON from the textarea replaces the channel settings entirely via `patchConfig({ channels: { [name]: settings } })`. If the user accidentally deletes a key from the JSON, that setting is permanently lost. There is no confirmation dialog before saving destructive changes.

- **Settings tab sends secrets in plaintext over GET response** -- `app/api/settings/route.ts:14-18` -- The GET endpoint returns the full `openclawGatewayToken` and `tamboApiKey` values in the response body. While the inputs use `type="password"` for display masking, the actual secret values travel in the JSON response and are visible in browser DevTools. The GET response should return masked values (e.g. `"****abcd"`) and only accept full values on PATCH.

### Minor (polish/improvement)

- **No label elements for any input fields across all three tabs** -- `channels-tab.tsx:201`, `config-tab.tsx:148`, `settings-tab.tsx:109,128,145` -- All input fields use a `<p>` tag as a visual label but lack an associated `<label>` element with `htmlFor`. This breaks screen reader accessibility -- users navigating with assistive technology cannot associate the description text with the input control.

- **Channels tab expand/collapse has no visual transition** -- `components/dashboard/tabs/channels-tab.tsx:195-232` -- The expanded editor section appears and disappears instantly with a conditional render (`expanded === ch.name ? ... : null`). An animated height transition would feel smoother and help users track the context change.

- **Config raw JSON viewer lacks copy-to-clipboard** -- `components/dashboard/tabs/config-tab.tsx:223-225` -- The raw config is displayed in a `<pre>` block. Power users who want to copy the full config for backup or debugging must manually select the text. A small copy button would be a practical addition.

- **Channels empty state could link to the Config tab** -- `components/dashboard/tabs/channels-tab.tsx:135-140` -- The empty state tells users to edit `openclaw.json`, but since the Config tab already exposes the raw config with an editor, it would be more actionable to link or navigate the user to the Config tab where they can add channel configuration directly.

- **Settings tab has no way to test the gateway connection** -- `components/dashboard/tabs/settings-tab.tsx` -- After entering a gateway URL and token, the user must navigate to another tab and observe whether data loads to confirm the connection works. A "Test Connection" button would provide immediate validation.

- **Config tab "No changes to save" message uses success styling** -- `components/dashboard/tabs/config-tab.tsx:82-86` -- When the user clicks "Save Changes" with no modifications, `setSaveResult("No changes to save")` is set. This string does not start with "Error" so it renders in green (`text-emerald-400`). A neutral/informational message should not appear as a success confirmation.

- **Channels textarea has fixed 10 rows regardless of content size** -- `components/dashboard/tabs/channels-tab.tsx:206` -- The textarea always renders with `rows={10}`. For a channel with minimal settings (e.g. `{ "enabled": true }`), this wastes vertical space. For complex settings, it may be too small. Auto-sizing or a resizable handle would improve the editing experience.

## Recommendations

1. **[Critical] Add JSON validation to the Channels editor** -- Before calling `handleSave`, validate the JSON with a try/catch and show a specific inline error with the parse error position. Consider replacing the plain textarea with a lightweight code editor (e.g. CodeMirror or Monaco) for syntax highlighting and bracket matching, or at minimum add a "Validate JSON" button.

2. **[Critical] Re-fetch config after successful save** -- In `config-tab.tsx`, after a successful PATCH, re-fetch the config to update the hash and all field values. Mirror the pattern already used in `channels-tab.tsx:111` (`await fetchChannels()`).

3. **[Critical] Fix soul/model clearing logic** -- Change the change-detection in `handleSave` to compare current values against the original values (not just check truthiness). Track original values separately so that clearing a field is detected as a real change.

4. **[Major] Add dirty-state tracking and navigation guards** -- Track whether any field has been modified from its fetched value. Show a visual indicator on the Save button when changes exist. Warn users (via `beforeunload` or an in-app modal) if they try to navigate away with unsaved changes.

5. **[Major] Auto-dismiss save feedback after 5 seconds** -- Use a `setTimeout` to clear `saveResult` after a few seconds, or use a toast notification system that auto-dismisses.

6. **[Major] Replace the model text input with a select/combobox** -- Use the model list from `lib/ai/models.ts` to populate a dropdown, with an "Other" option for custom model strings.

7. **[Major] Add a save confirmation dialog for channels** -- Before saving channel settings, show a diff or at minimum ask "Are you sure? This will replace all settings for this channel."

8. **[Major] Mask secrets in the settings GET response** -- Return masked values from the API and only accept full replacement values on PATCH. Display masked values in the UI with a "reveal" toggle.

9. **[Minor] Add proper `<label>` elements** -- Associate all form labels with their inputs using `htmlFor`/`id` pairs for accessibility compliance.

10. **[Minor] Add a "Test Connection" button to Settings** -- After saving gateway credentials, let users verify the connection works by hitting a lightweight health-check endpoint.
