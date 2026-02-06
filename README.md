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
| UI | React 19, Tailwind CSS, shadcn/ui (Radix), Phosphor Icons, Recharts |
| AI | Vercel AI SDK, AI Gateway (multi-provider), Tambo (generative UI) |
| Editor | CodeMirror |
| Database | PostgreSQL via Drizzle ORM |
| Cache | Redis (resumable streams, optional) |
| Auth | NextAuth v5 (credentials + guest) |
| Linting | Biome via Ultracite |
| Package manager | pnpm 9.x |

## Setup

### Prerequisites

- Node.js 18+
- pnpm 9.x
- PostgreSQL database
- An OpenClaw gateway running somewhere (defaults to `localhost:18789`)

### Environment

Copy `.env.example` to `.env.local` and fill in the values:

```
AUTH_SECRET=                        # openssl rand -base64 32
POSTGRES_URL=                       # PostgreSQL connection string
USER_SETTINGS_ENCRYPTION_KEY=       # openssl rand -base64 32
```

Optional:

```
REDIS_URL=                          # Redis (enables resumable streams)
OPENCLAW_GATEWAY_URL=               # fallback if not set in Settings UI
OPENCLAW_GATEWAY_TOKEN=             # fallback if not set in Settings UI
```

Gateway URL and token are typically configured per-user through the in-app **Settings** page, not as environment variables.

### Run

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

App runs on [localhost:3000](http://localhost:3000).

## Connecting your gateway

ClawBoard needs to reach your OpenClaw gateway over the internet. If your gateway runs on a local machine or private server, you can use [Tailscale Funnel](https://tailscale.com/kb/1223/funnel) to securely expose it with HTTPS — no port forwarding or public IP required.

### 1. Install Tailscale on your gateway server

```bash
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
```

### 2. Enable Funnel in your Tailscale ACL policy

Go to your [Tailscale Access Controls](https://login.tailscale.com/admin/acls), switch to the **JSON editor**, and add the following `nodeAttrs` block:

```json
"nodeAttrs": [
  {
    "target": ["autogroup:member"],
    "attr": ["funnel"]
  }
]
```

Save the policy.

### 3. Start the funnel

```bash
# First-time setup: cycle the connection to trigger public DNS zone creation
tailscale down && sleep 15 && tailscale up && sleep 10

# Expose your gateway on HTTPS (runs in the background)
tailscale funnel --bg 18789
```

Verify it's working:

```bash
dig +short <your-machine>.ts.net @8.8.8.8
# Should return a Tailscale relay IP
```

### 4. Configure ClawBoard

Open **Settings** in ClawBoard and enter:

- **Gateway URL**: `https://<your-machine>.ts.net`
- **Gateway Token**: your gateway's access token

That's it — ClawBoard will connect to your agent through the secure tunnel.

### Security

The gateway URL is publicly reachable via Funnel, but all API endpoints are protected by your access token. Every request ClawBoard sends includes the token as an `Authorization: Bearer` header. Requests without a valid token are rejected by the gateway.

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
│   └── api/
│       ├── chat/        # streaming chat endpoint
│       ├── document/    # document CRUD
│       ├── files/       # file uploads
│       ├── history/     # chat history
│       └── suggestions/ # AI suggestions
└── api/
    ├── openclaw/        # 14 dashboard API routes
    └── settings/        # per-user encrypted settings

components/
├── dashboard/
│   ├── tabs/            # 9 tab components (sessions, logs, cron, etc.)
│   ├── exec-approval-overlay.tsx
│   └── event-feed.tsx   # SSE event feed
├── dashboard-panel-view.tsx    # tab router
├── sidebar-dashboard-nav.tsx   # nav links
└── chat.tsx                    # chat interface

lib/
├── openclaw/
│   ├── client.ts        # barrel re-exports
│   ├── core.ts          # invokeTool, chatCompletions
│   ├── types.ts         # shared types
│   ├── settings.ts      # per-user gateway config
│   └── *.ts             # feature modules (sessions, logs, cron, etc.)
├── ai/                  # models, tools, prompts, providers
├── db/                  # Drizzle schema, queries, migrations
├── security/            # encryption for user settings
└── errors.ts            # typed error system
```

## Commands

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Dev server (Turbo) |
| `pnpm build` | Run migrations + production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Check with Biome |
| `pnpm format` | Auto-fix with Biome |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:generate` | Generate new migration from schema changes |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:push` | Push schema directly to database |

## Gateway API

The OpenClaw client (`lib/openclaw/client.ts`) re-exports functions from feature modules, all of which call the gateway:

**Sessions**: `getSessionsList`, `getSessionMessages`
**Memory**: `queryMemory`, `addMemory`
**Cron**: `getCronJobs`, `addCronJob`, `updateCronJob`, `removeCronJob`
**Config**: `getConfig`, `patchConfig`, `extractSkillsFromConfig`
**Usage**: `getUsageSummary`, `getCostData`
**Logs**: `getRecentLogs`
**Tasks**: `getRecentTasks`
**Approvals**: `getPendingApprovals`, `resolveApproval`
**Channels**: `getChannels`, `updateChannel`
**Skills**: `getInstalledSkills`
**Webhooks**: `getErrors`, `getWebhookEvents`, `triggerWebhook`

Core utilities: `invokeTool`, `chatCompletions`, `getPrimarySessionKey`, `isPrivateUrl`

All functions fail silently (return empty arrays/objects) when the gateway is unreachable. API routes return 502 with a message.

## License

Based on [Chat SDK](https://chat-sdk.dev) by Vercel.
