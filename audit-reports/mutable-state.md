# Mutable State Audit Report

**Date:** 2026-02-09
**Scope:** `lib/`, `components/`, `hooks/`, `app/` (excluding `node_modules`, `.next`, `components/ui`)

---

## Summary

| Category | Count |
|---|---|
| Module-level mutable variables (global state) | 1 |
| `let` that should be `const` (never reassigned) | 0 |
| `let` used correctly (reassigned) | 28 |
| `var` declarations (in inline script string) | 4 |
| Reassigned function parameters | 0 |
| Mutable arrays/objects exported across modules | 3 |
| **Total issues requiring attention** | **5** |

---

## HIGH Severity

### 1. Module-level mutable cache without invalidation

**File:** `lib/openclaw/client.ts:223`
**Variable:** `cachedSessionKey`
**Issue:** A `let` variable at module scope acts as a naive in-memory cache for the primary session key. It is written on first access and never invalidated. In a serverless/edge environment, this may persist across requests unpredictably or reset on cold starts. There is no TTL, no size limit, and no way to bust the cache.

```typescript
let cachedSessionKey: string | undefined;
```

It is mutated at line 235:
```typescript
cachedSessionKey = details.sessions.at(0)?.key;
```

**Recommendation:** Replace with a proper caching strategy. Options:
- Use a `Map` with TTL-based expiry
- Use React cache / Next.js `unstable_cache` for server-side
- Accept the round-trip and remove the cache entirely (the cost is a single `invokeTool` call)

---

### 2. `var` declarations in inline script string

**File:** `app/layout.tsx:44-55`
**Variables:** `html`, `meta`, `isDark`, `observer`

```javascript
var html = document.documentElement;
var meta = document.querySelector('meta[name="theme-color"]');
var isDark = html.classList.contains('dark');
var observer = new MutationObserver(updateThemeColor);
```

**Issue:** These are inside a string template (`THEME_COLOR_SCRIPT`) injected via `<script dangerouslySetInnerHTML>`. While `var` is technically valid in an IIFE, it violates the project's ESLint/Biome convention of using `const`/`let` exclusively. The inline script is outside linter scope.

**Recommendation:** Change to `const`/`let` within the IIFE. Since this runs in the browser and targets modern browsers (Next.js 16), `const`/`let` are safe. This is a low-risk cosmetic fix.

---

## MEDIUM Severity

### 3. Exported mutable object: `DiffType`

**File:** `lib/editor/diff.js:6-10`

```javascript
export const DiffType = {
  Unchanged: 0,
  Deleted: -1,
  Inserted: 1,
};
```

**Issue:** While declared with `const`, the object itself is mutable -- any consumer can do `DiffType.Unchanged = 99`. This file is plain JS (no TypeScript `as const`). Since `diff.js` is a ported library, the risk is low but present.

**Recommendation:** Add `Object.freeze()` or convert to TypeScript with `as const`.

### 4. Exported mutable object: `tamboContextHelpers`

**File:** `lib/tambo/context.ts:1`

```typescript
export const tamboContextHelpers = { ... };
```

**Issue:** Same pattern -- mutable object exported. Any module can mutate the shared reference.

**Recommendation:** Use `as const` assertion or `Object.freeze()`.

### 5. Exported mutable array: `tamboTools`

**File:** `lib/tambo/tools.ts:3`

```typescript
export const tamboTools = [ ... ];
```

**Issue:** Array is mutable; consumers could `.push()` or `.splice()` the shared reference.

**Recommendation:** Use `as const` assertion (already common in the codebase) or `Object.freeze()`.

---

## LOW Severity / Informational

### Correctly used `let` declarations (no action needed)

All of the following `let` declarations are correctly used because they are reassigned:

| File | Line(s) | Variable(s) | Pattern |
|---|---|---|---|
| `lib/editor/diff.js` | 24-25 | `left`, `right` | Loop counters (for-loop traversal) |
| `lib/editor/diff.js` | 99 | `oldStartIndex` | For-loop counter |
| `lib/editor/diff.js` | 107-108 | `oldEndIndex`, `newEndIndex` | For-loop counter |
| `lib/editor/diff.js` | 132, 357, 367, 378 | `i` | Standard for-loop index |
| `lib/editor/diff.js` | 145-146 | `left`, `right` | While-loop pointers |
| `lib/editor/diff.js` | 152-154 | `updateLeft`, `updateRight` | Conditional assignment |
| `lib/editor/diff.js` | 240 | `diffs` | Reassigned on line 243 |
| `lib/editor/diff.js` | 274 | `lineStart` | Index tracker |
| `lib/editor/diff.js` | 383 | `textNode` | For-loop variable |
| `lib/editor/suggestions.tsx` | 24 | `positions` | Assigned inside callback |
| `lib/db/queries.ts` | 172 | `filteredChats` | Conditionally assigned |
| `lib/ai/prompts.ts` | 118 | `mediaType` | Conditionally reassigned |
| `lib/ai/tools/get-weather.ts` | 45-46 | `latitude`, `longitude` | Conditionally assigned |
| `lib/ai/tools/request-suggestions.ts` | 59 | `processedCount` | Incremented in loop |
| `components/chat.tsx` | 356-357 | `currentOpenClawUserMessageId`, `currentOpenClawChatContext` | Reassigned in loop |
| `components/ai-elements/prompt-input.tsx` | 1045 | `Icon` | Conditionally reassigned |
| `components/ai-elements/prompt-input.tsx` | 1164, 1166 | `finalTranscript`, `i` | String concatenation / loop |
| `components/ai-elements/edge.tsx` | 57-58 | `offsetX`, `offsetY` | Reassigned in switch |
| `components/diffview.tsx` | 25 | `className` | Reassigned in switch |
| `components/elements/prompt-input.tsx` | 166 | `Icon` | Conditionally reassigned |
| `components/dashboard/tabs/logs-tab.tsx` | 17-19 | `lastIndex`, `match`, `key` | Regex loop state |
| `hooks/use-scroll-to-bottom.tsx` | 40 | `scrollTimeout` | Timeout reference |
| `app/(chat)/layout.tsx` | 34 | `tamboApiKey` | Conditionally assigned |
| `app/(chat)/api/chat/route.ts` | 52, 89-90 | `requestBody`, `messagesFromDb`, `chatTitle` | Assigned in try/catch or conditionally |
| `app/(auth)/login/page.tsx` | 18 | `decoded` | Try/catch assignment |
| `app/(auth)/register/page.tsx` | 17 | `decoded` | Try/catch assignment |

### No issues found

- **`var` declarations in source code:** None found (only in inline script string in `app/layout.tsx`)
- **Reassigned function parameters:** None found
- **State managed via plain variables instead of React state:** None found (all React components properly use `useState`/`useRef`/context)

---

## Recommendations Summary

| Priority | Action | Files |
|---|---|---|
| HIGH | Replace module-level cache with proper caching strategy | `lib/openclaw/client.ts` |
| MEDIUM | Freeze or use `as const` on exported objects/arrays | `lib/editor/diff.js`, `lib/tambo/context.ts`, `lib/tambo/tools.ts` |
| LOW | Change `var` to `const` in IIFE script string | `app/layout.tsx` |

---

## Overall Assessment

The codebase has **very few mutable state issues**. There is only one true module-level mutable variable (`cachedSessionKey`), and all `let` declarations are appropriately used where reassignment occurs. No `var` declarations exist in linted source files. No function parameters are reassigned. React state management is done properly through hooks and context throughout.

The main concern is the module-level cache in `lib/openclaw/client.ts`, which could behave unpredictably in serverless environments. The exported mutable objects are a minor concern since they represent configuration constants that should be frozen.
