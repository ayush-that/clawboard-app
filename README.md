# ClawBoard

A web dashboard for managing [OpenClaw](https://github.com/openclaw) agents. Monitor sessions, view logs, manage cron jobs, edit config, search memory, track token usage — all from a single UI.

Built on top of [Chat SDK](https://chat-sdk.dev) v3.1.0, so you also get a full chat interface that can talk directly to your OpenClaw agent.

## What it does

ClawBoard connects to an OpenClaw gateway and gives you a panel for each major concern:

- **Sessions** — See active sessions, drill into message history, check token counts
- **Logs** — Live agent logs with level filtering (info/warn/error/debug) and auto-scroll
- **Cron** — Create, edit, enable/disable, and delete scheduled tasks
- **Memory** — Search the agent's persistent memory, add new entries
- **Skills** — View installed skills, color-coded by source (workspace, built-in, installed, config)
- **Usage** — Token consumption and cost breakdowns by day, model, and session
- **Channels** — Manage integration channels (Slack, Discord, etc.)
- **Config** — Edit the agent model, personality/soul prompt, or raw JSON config
- **Settings** — Per-user preferences and gateway credentials

There's also a global **Exec Approval** overlay that polls for pending tool execution requests and lets you allow or deny them in real time.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS, shadcn/ui (Radix), Phosphor Icons |
| AI | Vercel AI SDK, AI Gateway (multi-provider) |
| Database | PostgreSQL via Drizzle ORM |
| Cache | Redis (resumable streams) |
| Auth | NextAuth v5 (credentials + guest) |
| Linting | Biome via Ultracite |
| Package manager | pnpm 9.12.3 |

## Setup

### Prerequisites

- Node.js 18+
- pnpm 9.x
- PostgreSQL database
- Redis instance
- An OpenClaw gateway running somewhere (defaults to `localhost:18789`)

### Environment

Copy `.env.example` to `.env.local` and fill in the values:

```
AUTH_SECRET=                        # openssl rand -base64 32
POSTGRES_URL=                       # PostgreSQL connection string
REDIS_URL=                          # Redis connection string
USER_SETTINGS_ENCRYPTION_KEY=       # openssl rand -base64 32
BLOB_READ_WRITE_TOKEN=              # Vercel Blob (for file uploads)
AI_GATEWAY_API_KEY=                 # Vercel AI Gateway key (not needed on Vercel deployments)
OPENCLAW_GATEWAY_URL=               # defaults to http://localhost:18789
OPENCLAW_GATEWAY_TOKEN=             # optional, if your gateway requires auth
```

### Run

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

App runs on [localhost:3000](http://localhost:3000).

## How it works

The dashboard lives in a sidebar panel alongside the chat. Each tab is a client component that fetches from `/api/openclaw/*` routes. Those routes authenticate via NextAuth, then call functions from `lib/openclaw/client.ts`, which talks to the OpenClaw gateway using its `/tools/invoke` endpoint.

```
Browser tab component
  → GET /api/openclaw/sessions
    → auth check
    → lib/openclaw/client.ts → getSessionsList()
      → POST gateway/tools/invoke { tool: "sessions_list" }
    → transform response → JSON back to client
```

Config editing uses optimistic locking — the GET returns a hash, and PATCH sends it back so you don't clobber someone else's changes.

The chat side uses Vercel AI SDK's `streamText()` to stream responses from the agent. The agent model routes through the gateway at `/v1/chat/completions` with a session key tied to the chat ID.

## Project structure

```
app/
├── (auth)/              # login, register, NextAuth routes
├── (chat)/              # chat UI, chat API, documents, history
│   └── api/chat/        # streaming chat endpoint
└── api/
    ├── openclaw/        # 14 dashboard API routes
    └── settings/        # per-user encrypted settings

components/
├── dashboard/
│   ├── tabs/            # 9 tab components (sessions, logs, cron, etc.)
│   └── exec-approval-overlay.tsx
├── dashboard-panel-view.tsx    # tab router
├── sidebar-dashboard-nav.tsx   # nav links
└── chat.tsx                    # chat interface

lib/
├── openclaw/
│   ├── client.ts        # gateway client (30+ functions)
│   ├── types.ts         # shared types
│   └── settings.ts      # per-user gateway config
├── ai/                  # models, tools, prompts, providers
├── db/                  # Drizzle schema, queries, migrations
└── errors.ts            # typed error system
```

## Commands

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Dev server (Turbo) |
| `pnpm build` | Run migrations + production build |
| `pnpm lint` | Check with Biome |
| `pnpm format` | Auto-fix with Biome |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:generate` | Generate new migration from schema changes |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:push` | Push schema directly to database |

## Gateway API

The OpenClaw client (`lib/openclaw/client.ts`) exposes these functions, all of which call the gateway:

**Sessions**: `getSessionsList`, `getSessionMessages`
**Memory**: `queryMemory`, `addMemory`
**Cron**: `getCronJobs`, `addCronJob`, `updateCronJob`, `removeCronJob`
**Config**: `getConfig`, `patchConfig`
**Usage**: `getUsageSummary`, `getCostData`
**Logs**: `getRecentLogs`
**Approvals**: `getPendingApprovals`, `resolveApproval`
**Channels**: `getChannels`, `updateChannel`
**Skills**: `getInstalledSkills`

All functions fail silently (return empty arrays/objects) when the gateway is unreachable. API routes return 502 with a message.

## License

Based on [Chat SDK](https://chat-sdk.dev) by Vercel.
