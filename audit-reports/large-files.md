# Large Files & Monolithic Code Audit

**Date:** 2026-02-09
**Scope:** All `.ts`, `.tsx`, `.js`, `.jsx` files (excluding `node_modules/`, `.next/`, `ai-sdk/`)

---

## Summary

| Metric | Value |
|---|---|
| Total source files | 224 |
| Total lines of code | 28,571 |
| Files 500+ lines | 5 |
| Files 300-499 lines | 14 |
| Files 100-299 lines | 71 |
| Files 0-99 lines | 134 |

---

## Top 20 Largest Files

| # | Lines | File | Concern Level |
|---|---|---|---|
| 1 | 1,424 | `components/ai-elements/prompt-input.tsx` | CRITICAL |
| 2 | 772 | `components/ui/sidebar.tsx` | Low (auto-generated UI) |
| 3 | 736 | `lib/openclaw/client.ts` | HIGH |
| 4 | 679 | `lib/db/queries.ts` | HIGH |
| 5 | 524 | `components/artifact.tsx` | MODERATE |
| 6 | 476 | `components/toolbar.tsx` | MODERATE |
| 7 | 475 | `lib/editor/diff.js` | Low (utility) |
| 8 | 460 | `components/multimodal-input.tsx` | MODERATE |
| 9 | 448 | `components/ai-elements/message.tsx` | MODERATE |
| 10 | 434 | `components/weather.tsx` | MODERATE |
| 11 | 428 | `components/dashboard/tabs/cron-tab.tsx` | MODERATE |
| 12 | 412 | `components/chat.tsx` | MODERATE |
| 13 | 407 | `components/message.tsx` | MODERATE |
| 14 | 365 | `components/ai-elements/open-in-chat.tsx` | Low |
| 15 | 347 | `components/sidebar-history.tsx` | Low |
| 16 | 332 | `components/dashboard/tabs/sessions-tab.tsx` | Low |
| 17 | 310 | `components/icons.tsx` | MODERATE |
| 18 | 308 | `lib/tambo/components.ts` | Low |
| 19 | 300 | `app/(chat)/api/chat/route.ts` | MODERATE |
| 20 | 287 | `components/ai-elements/inline-citation.tsx` | Low |

---

## Files with Most Function/Constant Definitions

| # | Count | File | Pattern |
|---|---|---|---|
| 1 | 99 | `components/ai-elements/prompt-input.tsx` | God component -- 81 exports, 7 useState, 8 useEffect |
| 2 | 68 | `components/icons.tsx` | Icon barrel -- 63 exported SVG icon components |
| 3 | 56 | `lib/openclaw/client.ts` | Gateway client -- 23 exported API functions |
| 4 | 32 | `components/toolbar.tsx` | Complex component with 11 hooks (6 useState, 5 useEffect) |
| 5 | 29 | `components/ai-elements/message.tsx` | Multi-part message renderer |
| 6 | 28 | `lib/db/queries.ts` | Database query bag -- 26 exported functions |
| 7 | 25 | `lib/hugeicons.tsx` | Icon barrel -- 22 exported icon components |
| 8 | 23 | `components/ai-elements/inline-citation.tsx` | Duplicated with elements/ version |
| 9 | 22 | `components/multimodal-input.tsx` | Complex input with 8 hooks |
| 10 | 22 | `components/dashboard/tabs/cron-tab.tsx` | Dashboard tab with 12 hooks (10 useState, 2 useEffect) |

---

## Files with Excessive Imports (15+)

| Imports | File |
|---|---|
| 23 | `components/chat.tsx` |
| 23 | `components/artifact.tsx` |
| 21 | `app/(chat)/api/chat/route.ts` |
| 17 | `components/app-sidebar.tsx` |
| 16 | `components/message.tsx` |

---

## God Components (Most State Hooks)

Components with 10+ combined `useState`/`useEffect` calls:

| Hooks | useState | useEffect | File |
|---|---|---|---|
| 15 | 7 | 8 | `components/ai-elements/prompt-input.tsx` |
| 13 | 11 | 2 | `components/dashboard/tabs/settings-tab.tsx` |
| 12 | 10 | 2 | `components/dashboard/tabs/cron-tab.tsx` |
| 12 | 10 | 2 | `components/dashboard/tabs/config-tab.tsx` |
| 11 | 9 | 2 | `components/dashboard/tabs/channels-tab.tsx` |
| 11 | 6 | 5 | `components/toolbar.tsx` |
| 11 | 5 | 6 | `components/chat.tsx` |
| 11 | 11 | 0 | `components/dashboard/tabs/memory-tab.tsx` |
| 10 | 6 | 4 | `components/artifact.tsx` |

---

## Monolithic Code Patterns Found

### 1. CRITICAL: `components/ai-elements/prompt-input.tsx` (1,424 lines, 81 exports)

This is the single most problematic file. It defines **81 exported symbols** (types, components, contexts, hooks) in a single file. It includes:
- 15+ exported type definitions (`PromptInputControllerProps`, `PromptInputProps`, `PromptInputBodyProps`, etc.)
- Multiple React contexts and providers
- 7 `useState` and 8 `useEffect` hooks in the main component
- Sub-components that should be separate files (attachment handler, footer, header, textarea, tools)

**Recommendation:** Split into a `prompt-input/` directory with:
- `types.ts` -- shared types
- `context.tsx` -- context providers
- `prompt-input.tsx` -- main component
- `attachments.tsx` -- attachment sub-components
- `body.tsx`, `header.tsx`, `footer.tsx` -- layout sub-components

### 2. HIGH: `lib/openclaw/client.ts` (736 lines, 23 exported functions)

A single file containing **all** OpenClaw gateway client functions (23 exports). Functions cover completely different domains: tasks, skills, memory, webhooks, cron, sessions, config, usage, approvals, channels, and logs.

**Recommendation:** Split by domain into:
- `client/tasks.ts`
- `client/sessions.ts`
- `client/cron.ts`
- `client/config.ts`
- `client/usage.ts`
- `client/channels.ts`
- `client/logs.ts`
- `client/approvals.ts`
- `client/index.ts` -- re-exports for backward compat

### 3. HIGH: `lib/db/queries.ts` (679 lines, 26 exported functions)

All database queries in a single file. Covers users, chats, messages, documents, suggestions, votes, streams, and settings -- completely unrelated domains mixed together.

**Recommendation:** Split by entity:
- `queries/user.ts`
- `queries/chat.ts`
- `queries/message.ts`
- `queries/document.ts`
- `queries/vote.ts`
- `queries/stream.ts`
- `queries/settings.ts`
- `queries/index.ts` -- re-exports

### 4. MODERATE: Duplicated Component Directories

`components/ai-elements/` (28 files) and `components/elements/` (15 files) share **11 overlapping filenames**:

| File | ai-elements | elements | Near-identical? |
|---|---|---|---|
| `inline-citation.tsx` | 287 lines | 287 lines | YES (likely copy) |
| `loader.tsx` | 96 lines | 96 lines | YES (likely copy) |
| `suggestion.tsx` | 53 lines | 53 lines | YES (likely copy) |
| `image.tsx` | 25 lines | 25 lines | YES (likely copy) |
| `prompt-input.tsx` | 1,424 lines | 243 lines | Different versions |
| `message.tsx` | 448 lines | 58 lines | Different versions |
| `web-preview.tsx` | 263 lines | 252 lines | Mostly duplicated |
| `reasoning.tsx` | 189 lines | 175 lines | Mostly duplicated |
| `tool.tsx` | 168 lines | 152 lines | Mostly duplicated |
| `conversation.tsx` | 100 lines | 65 lines | Mostly duplicated |
| `task.tsx` | 87 lines | 94 lines | Mostly duplicated |

At least 4 files appear to be exact copies (same line count). Several others are near-duplicates. This is a significant maintainability concern -- bug fixes must be applied in two places.

**Recommendation:** Consolidate into one directory. If both variants are needed, use composition/props rather than file duplication.

### 5. MODERATE: Icon Barrel Files

- `components/icons.tsx` (310 lines, 63 exports) -- Inline SVG icon components
- `lib/hugeicons.tsx` (179 lines, 22 exports) -- More icon components

310 lines of icon SVGs in a single file is a code smell. Each icon component is small, but bundling 63 together makes the file hard to navigate and means importing any one icon requires parsing all 63.

**Recommendation:** Consider using an icon library, or at minimum splitting into `icons/` directory with files by category.

### 6. MODERATE: Dashboard Tab Components

Several dashboard tabs have high state complexity for what should be presentation-focused components:

- `cron-tab.tsx` (428 lines, 10 useState, 2 useEffect) -- CRUD for cron jobs, inline form + list
- `settings-tab.tsx` (285 lines, 11 useState, 2 useEffect) -- Manages settings form state
- `config-tab.tsx` (247 lines, 10 useState, 2 useEffect) -- Config editor with optimistic locking
- `channels-tab.tsx` (266 lines, 9 useState, 2 useEffect) -- Channel management
- `memory-tab.tsx` (213 lines, 11 useState, 0 useEffect) -- Memory management

**Recommendation:** Extract form state into custom hooks. Consider using a form library (react-hook-form or zod-form) to reduce boilerplate state management.

### 7. MODERATE: `app/(chat)/api/chat/route.ts` (300 lines, 31 control flow statements)

The main chat API route has 21 imports and 31 control flow statements (if/switch/try/catch/for). This is a complex server-side handler mixing auth, validation, rate limiting, AI streaming, and data persistence.

**Recommendation:** Extract middleware concerns (auth, rate limiting) and data persistence into separate modules.

---

## IIFE Patterns

Only one file uses IIFE-like patterns:
- `app/layout.tsx` -- Contains a `(function ...)` pattern, but this is minimal and expected for layout initialization.

No instances of the anti-pattern of 700+ functions in a single IIFE were found.

---

## Files Approaching 12,000 Lines

No files approach 12,000 lines. The largest file is 1,424 lines, which is well below that threshold but still far too large for a single component file.

---

## Overall Risk Assessment

| Risk | Count | Details |
|---|---|---|
| CRITICAL (1000+ lines) | 1 | `prompt-input.tsx` at 1,424 lines |
| HIGH (700+ lines) | 2 | `client.ts` (736), `queries.ts` (679) |
| MODERATE (400-700 lines) | 8 | Various components and utilities |
| Duplicated files | ~11 | Between `ai-elements/` and `elements/` |
| God components (10+ hooks) | 9 | Dashboard tabs and core UI components |
| Icon barrels | 2 | `icons.tsx` (63 exports), `hugeicons.tsx` (22 exports) |

---

## Prioritized Recommendations

1. **Split `prompt-input.tsx`** -- 1,424 lines with 81 exports is the most urgent refactor target
2. **Consolidate `ai-elements/` and `elements/`** -- Eliminate the ~11 duplicated component files
3. **Split `lib/openclaw/client.ts`** -- Break 23 functions into domain-specific modules
4. **Split `lib/db/queries.ts`** -- Break 26 functions into entity-specific query modules
5. **Extract dashboard tab state** -- Move useState-heavy patterns into custom hooks or a form library
6. **Reorganize icon components** -- Replace 85 inline SVG exports with an icon library or directory structure
7. **Decompose `chat/route.ts`** -- Extract auth, rate limiting, and persistence from the API handler
