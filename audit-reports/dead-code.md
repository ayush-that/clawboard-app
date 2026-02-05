# Dead Code Audit Report

**Date:** 2026-02-09
**Scope:** `lib/`, `components/`, `app/`, `hooks/`, `artifacts/`
**Method:** Export/import cross-referencing, commented-out code scanning, file reference analysis

---

## Summary

| Category | Findings | Estimated Dead LOC |
|---|---|---|
| Entirely commented-out file | 1 | 253 |
| Unreferenced file (no imports) | 2 | 94 |
| Unused exported functions | 12 | ~210 |
| Unused exported types/constants | 10 | ~35 |
| Unused exported icons | 22 | ~44 |
| Deprecated schema tables (no consumers) | 2 | ~25 |
| **Total** | **49 findings** | **~661 LOC** |

---

## 1. Entirely Commented-Out File

### 1.1 `lib/db/helpers/01-core-to-parts.ts` -- 253 LOC
- **Severity:** HIGH
- **Type:** Commented-out code (entire file)
- **Lines:** 1-253 (all 253 lines are comments)
- **Description:** Legacy migration helper for converting messages from deprecated `Message` table to `Message_v2` parts-based format. Every single line of executable code is commented out. The file header says "This is a helper for an older version of ai, v4.3.13".
- **Recommendation:** Delete the file entirely. It serves no purpose and adds confusion. If migration history is needed, it lives in git.

---

## 2. Unreferenced Files (Never Imported)

### 2.1 `lib/ai/models.test.ts` -- 81 LOC
- **Severity:** HIGH
- **Type:** Unreferenced file
- **Lines:** 1-81
- **Description:** Exports `chatModel`, `reasoningModel`, `titleModel`, `artifactModel` using `MockLanguageModelV3`. No file in the codebase imports from `models.test.ts`. The project uses `models.mock.ts` instead (imported via `require` in `providers.ts`). This appears to be a duplicate/superseded mock file.
- **Recommendation:** Delete. The `models.mock.ts` file serves the same purpose and is actively used.

### 2.2 `lib/editor/react-renderer.tsx` -- 13 LOC
- **Severity:** MEDIUM
- **Type:** Unreferenced file
- **Lines:** 1-13
- **Description:** Exports `ReactRenderer` class with a static `render` method. No file in the codebase imports `ReactRenderer`. Appears to be leftover from a previous editor implementation.
- **Recommendation:** Delete.

---

## 3. Unused Exported Functions

### 3.1 `lib/utils.ts` -- `fetchWithErrorHandlers()` -- ~20 LOC
- **File:** `lib/utils.ts:29-49`
- **Severity:** MEDIUM
- **Description:** Exported but never imported anywhere. The similar `fetcher` function at line 18 is used instead.
- **Recommendation:** Remove export and function.

### 3.2 `lib/utils.ts` -- `getLocalStorage()` -- ~6 LOC
- **File:** `lib/utils.ts:51-56`
- **Severity:** MEDIUM
- **Description:** Exported but never imported.
- **Recommendation:** Remove.

### 3.3 `lib/utils.ts` -- `getMostRecentUserMessage()` -- ~4 LOC
- **File:** `lib/utils.ts:69-72`
- **Severity:** LOW
- **Description:** Exported but never imported. Previously used in chat route, now removed.
- **Recommendation:** Remove.

### 3.4 `lib/utils.ts` -- `getTrailingMessageId()` -- ~10 LOC
- **File:** `lib/utils.ts:84-94`
- **Severity:** LOW
- **Description:** Exported but never imported.
- **Recommendation:** Remove.

### 3.5 `lib/db/queries.ts` -- `voteMessage()` -- ~30 LOC
- **File:** `lib/db/queries.ts:272-302`
- **Severity:** HIGH
- **Description:** Exported but never imported anywhere. Vote functionality appears to be wired in the schema but has no consumer.
- **Recommendation:** Remove if voting feature is not planned.

### 3.6 `lib/db/queries.ts` -- `getVotesByChatId()` -- ~12 LOC
- **File:** `lib/db/queries.ts:303-313`
- **Severity:** HIGH
- **Description:** Exported but never imported.
- **Recommendation:** Remove.

### 3.7 `lib/db/queries.ts` -- `getMessageById()` -- ~12 LOC
- **File:** `lib/db/queries.ts:440-450`
- **Severity:** MEDIUM
- **Description:** Exported but never imported.
- **Recommendation:** Remove.

### 3.8 `lib/db/queries.ts` -- `deleteMessagesByChatIdAfterTimestamp()` -- ~40 LOC
- **File:** `lib/db/queries.ts:451-490`
- **Severity:** HIGH
- **Description:** Exported but never imported. Complex function with sub-query for cascading message deletion.
- **Recommendation:** Remove.

### 3.9 `lib/db/queries.ts` -- `updateChatVisibilityById()` -- ~14 LOC
- **File:** `lib/db/queries.ts:491-507`
- **Severity:** MEDIUM
- **Description:** Exported but never imported.
- **Recommendation:** Remove.

### 3.10 `lib/db/queries.ts` -- `updateChatTitleById()` -- ~14 LOC
- **File:** `lib/db/queries.ts:508-521`
- **Severity:** MEDIUM
- **Description:** Exported but never imported.
- **Recommendation:** Remove.

### 3.11 `lib/db/queries.ts` -- `getStreamIdsByChatId()` -- ~18 LOC
- **File:** `lib/db/queries.ts:575-592`
- **Severity:** MEDIUM
- **Description:** Exported but never imported.
- **Recommendation:** Remove.

### 3.12 `lib/errors.ts` -- `getMessageByErrorCode()` -- ~42 LOC
- **File:** `lib/errors.ts:74-116`
- **Severity:** LOW
- **Description:** Exported but only used internally within the same file (by `ChatSDKError` constructor). The export is unnecessary; this function does not need to be public.
- **Recommendation:** Remove the `export` keyword (keep the function as private).

---

## 4. Unused Exported Types and Constants

### 4.1 `lib/ai/models.ts` -- `modelsByProvider` -- ~10 LOC
- **File:** `lib/ai/models.ts:22-31`
- **Severity:** MEDIUM
- **Description:** Exported constant never imported. Was likely used for a model selector UI that no longer exists (only one model "openclaw" remains).
- **Recommendation:** Remove.

### 4.2 `lib/ai/models.ts` -- `chatModels` array + `ChatModel` type -- ~12 LOC
- **File:** `lib/ai/models.ts:4-19`
- **Severity:** LOW
- **Description:** `chatModels` array is never imported. `ChatModel` type is never imported. Only `DEFAULT_CHAT_MODEL` is used from this file. The array has a single entry.
- **Recommendation:** Consider removing `chatModels`, `ChatModel`, and `modelsByProvider` if the model selector UI is permanently removed.

### 4.3 `lib/types.ts` -- `DataPart` type -- ~1 LOC
- **File:** `lib/types.ts:10`
- **Severity:** LOW
- **Description:** Exported type never imported.
- **Recommendation:** Remove.

### 4.4 `lib/types.ts` -- `messageMetadataSchema` + `MessageMetadata` -- ~4 LOC
- **File:** `lib/types.ts:12-16`
- **Severity:** LOW
- **Description:** `messageMetadataSchema` and `MessageMetadata` are exported but never imported directly. `MessageMetadata` is used indirectly via `ChatMessage` type inference but the schema itself is redundant since `ChatMessage` already includes it.
- **Recommendation:** Review if these can be inlined or removed.

### 4.5 `lib/ai/providers.ts` -- `ProviderSettings` type -- ~4 LOC
- **File:** `lib/ai/providers.ts:10-13`
- **Severity:** LOW
- **Description:** Exported type never imported. The functions that accept it (`getLanguageModel`, `getTitleModel`, `getArtifactModel`) use it inline.
- **Recommendation:** Remove the export or inline.

### 4.6 `lib/ai/providers.ts` -- `getTitleModel()` -- ~8 LOC
- **File:** `lib/ai/providers.ts:80-88`
- **Severity:** MEDIUM
- **Description:** Exported function never imported. Title generation likely now uses `getLanguageModel` or `getOpenClawChat` directly.
- **Recommendation:** Remove.

### 4.7 `lib/ai/prompts.ts` -- `titlePrompt` -- ~14 LOC
- **File:** `lib/ai/prompts.ts:131-144`
- **Severity:** MEDIUM
- **Description:** Exported constant never imported. Was likely used with `getTitleModel()` which is also dead.
- **Recommendation:** Remove.

### 4.8 `lib/errors.ts` -- `ErrorType`, `Surface`, `ErrorVisibility`, `visibilityBySurface`
- **File:** `lib/errors.ts:1-38`
- **Severity:** LOW
- **Description:** These types and the `visibilityBySurface` constant are exported but never imported. They are only used internally by `ChatSDKError`. Only `ErrorCode` and `ChatSDKError` are imported from this module.
- **Recommendation:** Remove exports (keep as module-private).

### 4.9 `lib/artifacts/server.ts` -- Exported types
- **File:** `lib/artifacts/server.ts:11-37`
- **Severity:** LOW
- **Description:** `SaveDocumentProps`, `CreateDocumentCallbackProps`, `UpdateDocumentCallbackProps`, `DocumentHandler` are exported but never imported. Only `createDocumentHandler` and `artifactKinds` are used externally.
- **Recommendation:** Remove unnecessary exports.

---

## 5. Unused Exported Icons

### 5.1 `components/icons.tsx` -- 17 unused icon exports -- ~34 LOC
- **Severity:** MEDIUM
- **Description:** The following icons are exported but never imported anywhere in the codebase:

| Icon | Line |
|---|---|
| `BotIcon` | 90 |
| `UserIcon` | 91 |
| `AttachmentIcon` | 92 |
| `BoxIcon` | 93 |
| `HomeIcon` | 94 |
| `GPSIcon` | 95 |
| `InvoiceIcon` | 96 |
| `RouteIcon` | 97 |
| `UploadIcon` | 100 |
| `MenuIcon` | 101 |
| `CheckedSquare` | 103 |
| `UncheckedSquare` | 108 |
| `MoreIcon` | 109 |
| `InfoIcon` | 111 |
| `MoreHorizontalIcon` | 115 |
| `ThumbUpIcon` | 134 |
| `ThumbDownIcon` | 135 |
| `ChevronDownIcon` | 136 |
| `GlobeIcon` | 146 |
| `LockIcon` | 147 |
| `EyeIcon` | 148 |
| `ShareIcon` | 149 |
| `CodeIcon` | 150 |
| `PlayIcon` | 151 |
| `ClockRewind` | 157 |
| `LogsIcon` | 161 |
| `DownloadIcon` | 164 |
| `LineChartIcon` | 165 |
| `GearIcon` | 171 |
| `MicIcon` | 172 |
| `ClockIcon` | 173 |
| `VercelIcon` | 179 |
| `GitIcon` | 198 |
| `LogoOpenAI` | 224 |
| `LogoGoogle` | 241 |
| `LogoAnthropic` | 271 |
| `PythonIcon` | 291 |

- **Note:** Some of these (like brand logos) may have been part of a model selector UI that was removed. At least 17 of these have zero imports.
- **Recommendation:** Remove all unused icon exports. The Phosphor icon imports they depend on can also be cleaned up.

### 5.2 `lib/hugeicons.tsx` -- 5 unused icon exports -- ~10 LOC
- **Severity:** LOW
- **Description:** The following icons are exported but never imported:

| Icon | Line |
|---|---|
| `WrenchIcon` | 126 |
| `CheckCircleIcon` | 129 |
| `XCircleIcon` | 130 |
| `CornerDownLeftIcon` | 146 |
| `ExternalLinkIcon` | 170 |
| `MessageCircleIcon` | 176 |
| `ImageIcon` | 152 |
| `MicIcon` | 155 |
| `PlusIcon` | 158 |
| `ClockIcon` | 123 |
| `DotIcon` | 140 |

- **Recommendation:** Remove unused exports.

---

## 6. Deprecated Schema Tables (No Active Consumers)

### 6.1 `lib/db/schema.ts` -- `messageDeprecated` table + `MessageDeprecated` type -- ~12 LOC
- **File:** `lib/db/schema.ts:39-49`
- **Severity:** HIGH
- **Description:** The deprecated `Message` table schema and its type are defined but never imported or referenced by any code. The only references are in the fully commented-out `01-core-to-parts.ts` migration helper.
- **Recommendation:** Remove after confirming migration is complete. Keep DB table for safety, but remove Drizzle schema definition.

### 6.2 `lib/db/schema.ts` -- `voteDeprecated` table + `VoteDeprecated` type -- ~18 LOC
- **File:** `lib/db/schema.ts:66-84`
- **Severity:** HIGH
- **Description:** Same as above. The deprecated vote table schema is defined but never referenced.
- **Recommendation:** Remove schema definition.

---

## 7. Stub / Vestigial Route

### 7.1 `app/(chat)/api/chat/[id]/stream/route.ts` -- 3 LOC
- **File:** `app/(chat)/api/chat/[id]/stream/route.ts:1-3`
- **Severity:** LOW
- **Description:** Route handler returns `204 No Content` with no functionality. Appears to be a leftover stub from resumable stream implementation.
- **Recommendation:** Verify if this endpoint is called by any client code, then remove if unused.

---

## Priority Actions

1. **Delete `lib/db/helpers/01-core-to-parts.ts`** (253 LOC) -- entirely commented out
2. **Delete `lib/ai/models.test.ts`** (81 LOC) -- unreferenced, superseded by `models.mock.ts`
3. **Delete `lib/editor/react-renderer.tsx`** (13 LOC) -- unreferenced
4. **Remove 7 unused DB query functions** from `lib/db/queries.ts` (~140 LOC)
5. **Remove deprecated schema tables** from `lib/db/schema.ts` (~30 LOC)
6. **Remove 17+ unused icon exports** from `components/icons.tsx` (~80 LOC, including brand SVGs)
7. **Remove unused utility functions** from `lib/utils.ts` (~40 LOC)
8. **Remove dead model/prompt exports** from `lib/ai/` (~24 LOC)
