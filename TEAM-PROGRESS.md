# Multi-Session Feature — Team Progress Tracker

## Goal
Each new chat creates a unique OpenClaw session. Users can switch between sessions via sidebar.

## Architecture
- OpenClaw routes sessions via model string: `openclaw:<sessionKey>`
- Previously hardcoded to `openclaw:main` — ALL chats shared one session
- Fix: each Chat gets a `openclawSessionKey` column (e.g., `webchat-<chatId>`)
- The model string becomes `openclaw:webchat-<chatId>` per chat

## Team Roster

| Agent | Role | Files | Status |
|-------|------|-------|--------|
| schema-worker | DB schema + migration + queries | `lib/db/schema.ts`, `lib/db/queries.ts` | DONE |
| client-worker | OpenClaw client + AI provider | `lib/openclaw/client.ts`, `lib/ai/providers.ts` | DONE |
| api-worker | Chat API route | `app/(chat)/api/chat/route.ts` | DONE |
| ui-worker | Sidebar + chat header session badge | `components/sidebar-history-item.tsx`, `components/chat-header.tsx` | DONE |

## Dependency Graph
```
schema-worker ──┐
                ├──> api-worker
client-worker ──┘
ui-worker (parallel, needed schema only)
```

## Task Breakdown

### 1. schema-worker (DB Layer)
- [x] Add `openclawSessionKey` (nullable text) to Chat table in `lib/db/schema.ts`
- [x] Generate Drizzle migration via `pnpm db:generate` → `0010_broad_cerebro.sql`
- [x] Update `saveChat()` in `lib/db/queries.ts` to accept + store `openclawSessionKey`
- [x] Chat type auto-inferred from schema via `InferSelectModel`

### 2. client-worker (OpenClaw Client + Provider)
- [x] Modify `getOpenClawChat(settings?, sessionKey?)` in `lib/ai/providers.ts`
- [x] Model string: `openclaw:${sessionKey ?? "main"}`
- [x] Update `getLanguageModel()`, `getTitleModel()`, `getArtifactModel()` signatures
- [x] Update `chatCompletions()` in `lib/openclaw/client.ts` — accepts sessionKey, default "main"
- [x] Update `invokeTool()` — accepts sessionKey param, default "main"

### 3. api-worker (Chat API Route)
- [x] New chats: `saveChat({ ..., openclawSessionKey: \`webchat-${id}\` })`
- [x] Session key resolution: `chat?.openclawSessionKey ?? \`webchat-${id}\``
- [x] Passed to `getLanguageModel(selectedChatModel, gwConfig, openclawSessionKey)`

### 4. ui-worker (Sidebar + Chat UI)
- [x] Sidebar item: "OC" badge on chats with openclawSessionKey
- [x] Chat header: "Session: webchat-..." pill badge
- [x] Memo comparison updated to include openclawSessionKey

## Verification
- [x] `pnpm format` — 0 fixes needed
- [x] `pnpm lint` — 0 issues
- [ ] `pnpm build` — pending (requires DB connection)
- [ ] `pnpm db:migrate` — pending (run in deployment)

## Files Changed (9 files, +324/-63 lines)
- `lib/db/schema.ts` — +1 line (openclawSessionKey column)
- `lib/db/queries.ts` — saveChat accepts openclawSessionKey
- `lib/ai/providers.ts` — sessionKey param on all provider functions
- `lib/openclaw/client.ts` — sessionKey param on invokeTool + chatCompletions
- `app/(chat)/api/chat/route.ts` — session key generation + routing
- `components/sidebar-history-item.tsx` — "OC" badge
- `components/chat-header.tsx` — session pill badge
- `lib/db/migrations/0010_broad_cerebro.sql` — ALTER TABLE add column
