# Error Handling Audit Report

**Date:** 2026-02-09
**Scope:** `lib/`, `app/api/`, `components/`, `hooks/`, `artifacts/`
**Auditor:** error-handling-auditor

---

## Summary

| Category | Count |
|---|---|
| Silent catch (no logging, no rethrow, no user feedback) | 24 |
| Console-only catch (logged but not surfaced/rethrown) | 2 |
| Generic catch with user-facing message but no logging | 18 |
| Catch with proper error propagation | 19 |
| **Total catch blocks audited** | **63** |
| **Total findings (swallowed/degraded)** | **44** |

**Overall risk: MEDIUM-HIGH.** The codebase has a systemic pattern of swallowing errors silently, especially in the OpenClaw gateway client (`lib/openclaw/client.ts`) and dashboard tab components. While many of these are "fallback to empty" patterns that provide graceful degradation for UI, they make debugging gateway connectivity issues extremely difficult because no error context is ever logged.

---

## Category 1: Silent Catch Blocks (No Logging, No Error Info)

These catch blocks discard the error entirely with no logging, no telemetry, and no user feedback. They are the most problematic because failures become invisible.

### CRITICAL

#### F1. `lib/db/queries.ts:517-519` -- `updateChatTitle`
**Severity: HIGH**
```
catch {
  return;
}
```
A database write failure is silently swallowed. Chat titles could fail to persist with zero indication. Since this function returns `void`, callers cannot detect the failure either.
**Fix:** Log the error with `console.error` and consider rethrowing or returning a result indicating failure.

---

#### F2. `lib/db/migrate.ts:21-23` -- Migration runner `.catch()`
**Severity: HIGH**
```
runMigrate().catch(() => {
  process.exit(1);
});
```
Migration failures exit the process with code 1 but log nothing. The error message, stack trace, and which migration failed are all lost.
**Fix:** Add `(error) => { console.error("Migration failed:", error); process.exit(1); }`.

---

#### F3. `app/(chat)/api/chat/route.ts:254-256` -- Redis stream error
**Severity: MEDIUM**
```
catch (_) {
  // ignore redis errors
}
```
Redis errors during resumable stream creation are completely swallowed. While failing to create a resumable stream is non-critical, silent failures make it impossible to diagnose why streams are not resumable.
**Fix:** Add `console.warn("Redis stream creation failed:", _)` to aid debugging.

---

### lib/openclaw/client.ts -- 18 Silent Catches

The gateway client has a consistent pattern: every public function wraps its body in `try { ... } catch { return []; }` (or similar empty/default return). While this provides graceful degradation, **no error is ever logged**.

#### F4-F21. All gateway client functions with silent catch

| # | Function | Line | Returns on Error | Severity |
|---|---|---|---|---|
| F4 | `getRecentTasks` | 256 | `[]` | MEDIUM |
| F5 | `getInstalledSkills` | 268 | `[]` | MEDIUM |
| F6 | `queryMemory` | 284 | `[]` | MEDIUM |
| F7 | `triggerWebhook` | 295 | `{ success: false, response: "Gateway unreachable" }` | LOW |
| F8 | `getCronJobs` | 310 | `[]` | MEDIUM |
| F9 | `getCostData` | 334 | `[]` | MEDIUM |
| F10 | `getSessionsList` | 396 | `[]` | MEDIUM |
| F11 | `getSessionMessages` | 412 | `[]` | MEDIUM |
| F12 | `addMemory` | 425 | `{ success: false, response: "Failed to add memory" }` | LOW |
| F13 | `getConfig` | 455 | `{ raw: "{}", hash: "" }` | MEDIUM |
| F14 | `extractSkillsFromConfig` | 507 | `[]` (parse error) | LOW |
| F15 | `getUsageSummary` | 562 | empty summary | MEDIUM |
| F16 | `getRecentLogs` | 629 | `[]` | MEDIUM |
| F17 | `getPendingApprovals` | 662 | `[]` | MEDIUM |
| F18 | `resolveApproval` | 675 | `{ success: false }` | MEDIUM |
| F19 | `getChannels` | 688 | `[]` | MEDIUM |
| F20 | `updateChannel` | 702 | `{ success: false }` | MEDIUM |
| F21 | `extractChannelsFromConfig` | 732 | `[]` (parse error) | LOW |

**Fix:** Add a shared error logging utility, e.g. `console.warn("[openclaw] ${fnName} failed:", error)` inside each catch. This preserves the graceful degradation pattern while making failures diagnosable.

---

#### F22. `components/dashboard/exec-approval-overlay.tsx:28-30` -- Fetch approvals
**Severity: MEDIUM**
```
catch {
  // silent -- gateway may not support exec approval
}
```
When polling fails, no feedback is shown to the user and nothing is logged.

#### F23. `components/dashboard/exec-approval-overlay.tsx:51-53` -- Resolve approval
**Severity: MEDIUM**
```
catch {
  // error resolving
}
```
When approval resolution fails, the user gets no feedback that their action was not completed. The approval is also removed from the UI (line 50) before the catch, so the UI shows it as resolved when it was not.

**Fix:** Move `setApprovals` filter into `.then()` or after confirming success. Show toast on error.

#### F24. `components/multimodal-input.tsx:209` -- File upload
**Severity: LOW**
```
catch {
  // upload failed
}
```
User gets no feedback when file drag-and-drop upload fails. The paste handler at line 256 does show a toast, making this inconsistent.

---

## Category 2: Console-Only Catch (Logged But Not Surfaced)

These catch blocks log the error but do not surface it to the user or rethrow it. The user experience silently degrades.

#### F25. `components/dashboard/tabs/config-tab.tsx:60-63` -- Config fetch
**Severity: LOW**
```
catch (err) {
  console.error("Config fetch failed:", err);
  setConfig(null);
}
```
This is actually one of the better patterns -- it logs the error and sets state to null. However, no error message is shown to the user explaining why config is empty. The UI just shows a blank config.

#### F26. `components/chat.tsx:325-331` -- Tambo rendering
**Severity: LOW**
```
.catch((error) => {
  console.warn("Tambo component rendering failed", error);
  toast({ type: "error", description: "..." });
});
```
This is well-handled: logs the error AND shows a toast. No issue here.

---

## Category 3: Generic Catch With User Feedback But No Logging

These catch blocks show a user-facing error message but do not log the underlying error, making server-side debugging difficult.

#### F27-F34. Dashboard tab components

| # | File | Line | User Message | Severity |
|---|---|---|---|---|
| F27 | `sessions-tab.tsx` | 88 | "Failed to load sessions..." | LOW |
| F28 | `sessions-tab.tsx` | 112 | "Failed to load messages..." | LOW |
| F29 | `logs-tab.tsx` | 90 | "Failed to load logs..." | LOW |
| F30 | `cron-tab.tsx` | 59, 89, 109, 129, 149 | Various cron errors | LOW |
| F31 | `skills-tab.tsx` | 38 | "Failed to load skills..." | LOW |
| F32 | `usage-tab.tsx` | 90 | "Failed to load usage data..." | LOW |
| F33 | `memory-tab.tsx` | 43, 72 | "Failed to search/add memory" | LOW |
| F34 | `channels-tab.tsx` | 66 | "Failed to load channels..." | LOW |

These all follow the same pattern: `catch { setError("User-friendly message"); }`. The error object is discarded. While the UI feedback is good, adding `console.error` would help debugging.

#### F35-F36. Settings and config save errors
- `channels-tab.tsx:110-111` -- `setSaveResult(\`Error: ${String(error)}\`)`
- `config-tab.tsx:113-114` -- `setSaveResult(\`Error: ${String(error)}\`)`
- `settings-tab.tsx:157-158` -- `setSaveResult(\`Error: ${String(error)}\`)`

These are actually well-handled (they surface the error to the user). Low severity.

---

## Category 4: Intentional/Acceptable Patterns

These are catch blocks that are appropriate for their context.

| File | Line | Pattern | Why Acceptable |
|---|---|---|---|
| `lib/db/queries.ts` | 51, 64, 91, etc. (18 functions) | `catch (_error) { throw new ChatSDKError(...) }` | Rethrows with typed error |
| `app/(chat)/api/chat/route.ts:44` | `catch (_) { return null; }` | Fallback for stream context | Non-critical feature detection |
| `app/(chat)/api/chat/route.ts:57` | `catch (_) { return ChatSDKError }` | Parse error returns 400 | Proper error response |
| `app/(chat)/api/chat/route.ts:259-274` | Outer catch | Handles `ChatSDKError` and gateway errors | Comprehensive |
| `lib/utils.ts:42-48` | `fetchWithErrorHandlers` | Re-throws with `ChatSDKError` | Proper error wrapping |
| `app/(auth)/actions.ts:35-41, 77-83` | Auth actions | Check `ZodError`, return status | Server action pattern |
| `app/(auth)/login/page.tsx:21, 40` | URL parsing | `catch { return null; }` | Safe URL validation |
| `app/(auth)/register/page.tsx:20, 39` | URL parsing | `catch { return null; }` | Safe URL validation |
| `settings-tab.tsx:35` | `isValidHttpUrl` | `catch { return false; }` | URL validation helper |
| `app/api/settings/route.ts:84` | URL validation | Returns `ChatSDKError` | Proper error response |
| `app/(chat)/layout.tsx:39` | Settings fetch | `catch { tamboApiKey = undefined; }` | Non-critical fallback |
| `lib/ai/tools/get-weather.ts:27` | Geocode | `catch { return null; }` | External API fallback |
| `artifacts/code/client.tsx:196` | Python exec | Sets output status to "failed" with message | User-visible error |
| OpenClaw API routes (12 routes) | Various | Return `{ error, message }` with 502 status | Proper HTTP error responses |
| `components/ai-elements/prompt-input.tsx:766, 776, 780` | Submit handlers | Empty catch with comment | Intentional: keep input for retry |
| `lib/openclaw/settings.ts:28` | DB fallback | Falls back to env vars | Graceful degradation with comment |

---

## Category 5: Specific Anti-Patterns

### A1. `catch` without binding the error parameter

**40 instances** use `catch {` (bare catch with no error variable). While ES2019-valid syntax, this means even if you wanted to log the error later, you'd need to modify the catch clause. This is a minor code smell but contributes to the "swallowing" pattern.

### A2. `_error` prefix convention inconsistently used

Some catches use `_error` (signaling intentional discard), some use `_`, and some use bare `catch {}`. There is no consistent convention.

### A3. No centralized error logging

There is no shared error logging utility (e.g., `reportError()`, Sentry, or even a wrapper around `console.error`). Each catch block independently decides whether to log, and most choose not to.

---

## Recommendations

### Priority 1 (High Impact, Low Effort)

1. **Add logging to `lib/openclaw/client.ts` catch blocks.** Create a simple helper:
   ```typescript
   const logGatewayError = (fn: string, error: unknown) =>
     console.warn(`[openclaw] ${fn} failed:`, error);
   ```
   Add this to every catch block. The graceful-degradation return values can stay.

2. **Fix `lib/db/queries.ts:updateChatTitle`** to at least `console.error` the failure.

3. **Fix `lib/db/migrate.ts`** to log the migration error before exiting.

4. **Fix `exec-approval-overlay.tsx:handleResolve`** to not remove the approval from UI until confirmed, and show a toast on failure.

### Priority 2 (Medium Impact)

5. **Add `console.error` to all dashboard tab catch blocks** that currently just `setError(...)` without logging. This aids server-side debugging.

6. **Add logging to `components/multimodal-input.tsx:209`** and show a toast (consistent with the paste handler at line 256).

7. **Log Redis stream creation failures** in `app/(chat)/api/chat/route.ts:254` at warn level.

### Priority 3 (Longer Term)

8. **Introduce a centralized error reporting utility** that can be swapped from `console.error` to a service like Sentry/Datadog. Every catch block should call this.

9. **Establish a convention** for catch blocks: always bind the error (`catch (error)`) and always call the reporting utility, even if the function returns a fallback.

---

## Files Audited

| Directory | Files Checked | Catch Blocks Found |
|---|---|---|
| `lib/` | 6 | 26 |
| `app/api/` | 14 | 16 |
| `app/(auth)/` | 3 | 5 |
| `app/(chat)/` | 2 | 4 |
| `components/` | 9 | 18 |
| `artifacts/` | 1 | 1 |
| **Total** | **35** | **63** (excluding commented-out code) |
