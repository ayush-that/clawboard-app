# ClawBoard Implementation Plan

## Overview

Transform the existing Chat SDK Next.js app into ClawBoard - an OpenClaw dashboard with Tambo generative UI. The existing chat infrastructure (auth, DB, sidebar, theme) stays intact. We add a new `/dashboard` route group with Tambo-powered generative components, API routes bridging to the OpenClaw gateway, and mock data fallbacks.

---

## Phase 1: Foundation (Tambo + API Layer)

### 1.1 Install Dependencies

```bash
pnpm add @tambo-ai/react recharts
```

- `@tambo-ai/react` - Tambo SDK for generative UI
- `recharts` - Charts library (Tambo-compatible, React-based)
- `zod` already exists in the project

### 1.2 Environment Setup

Add to `.env.local`:

```
NEXT_PUBLIC_TAMBO_API_KEY=<tambo_api_key>
OPENCLAW_GATEWAY_URL=http://localhost:18789
```

### 1.3 Create OpenClaw Types

**File: `lib/openclaw/types.ts`**

Define shared TypeScript types for all OpenClaw data structures:

- `AgentStatusData` - uptime, model, tokensToday, costToday, activeChannels, lastActivity
- `TaskData` - name, status (success/failed/running), startedAt, duration, result
- `SkillData` - name, description, enabled, lastUsed
- `MemoryData` - key, summary, timestamp, relevance
- `WebhookEventData` - source, payloadSummary, timestamp, actionTaken
- `ErrorData` - message, skill, timestamp, severity, resolved
- `CronJobData` - name, schedule, enabled, lastRun, nextRun, skill

### 1.4 Create OpenClaw Gateway Client

**File: `lib/openclaw/client.ts`**

HTTP client that talks to the OpenClaw gateway (or returns mock data if gateway is unavailable):

- `getStatus()` - GET `/status`
- `getTasks(timeRange)` - GET `/tasks?range=...`
- `getSkills()` - GET `/skills`
- `queryMemory(query)` - GET `/memory?q=...`
- `triggerWebhook(message)` - POST `/hooks/agent`
- `getCronJobs()` - GET `/cron`
- `getErrors()` - GET `/errors`

Each function tries the real gateway first, falls back to realistic mock data. This ensures the demo works without a running OpenClaw instance.

### 1.5 Create API Routes

**Directory: `app/api/openclaw/`**

| Route              | Method   | Handler                                              |
| ------------------ | -------- | ---------------------------------------------------- |
| `status/route.ts`  | GET      | Returns agent status                                 |
| `tasks/route.ts`   | GET      | Returns recent tasks (accepts `?range=` query param) |
| `skills/route.ts`  | GET      | Returns installed skills                             |
| `memory/route.ts`  | GET      | Queries agent memory (accepts `?q=` query param)     |
| `webhook/route.ts` | POST     | Forwards command to agent                            |
| `cron/route.ts`    | GET/POST | Read/write cron configs                              |
| `events/route.ts`  | GET      | SSE endpoint for real-time events                    |

Each route uses the gateway client from 1.4. Error handling returns appropriate HTTP status codes.

---

## Phase 2: Tambo Component Registry + Tools

### 2.1 Create Tambo Tool Definitions

**File: `lib/tambo/tools.ts`**

Define browser-side tools using `defineTool()` with `inputSchema` and `outputSchema`:

1. **`getAgentStatus`** - Fetches agent health/status from `/api/openclaw/status`
2. **`getRecentTasks`** - Fetches task executions with timeRange parameter from `/api/openclaw/tasks`
3. **`getInstalledSkills`** - Lists skills from `/api/openclaw/skills`
4. **`queryMemory`** - Searches agent memory from `/api/openclaw/memory`
5. **`triggerWebhook`** - Sends commands from `/api/openclaw/webhook`

### 2.2 Create Generative Components

All components go in `components/generative/` and use `"use client"` directive. Each receives typed props matching its Zod schema.

#### Core Components (MVP - must have):

**`AgentStatus.tsx`**

- Props: uptime, model, tokensToday, costToday, activeChannels[], lastActivity
- Renders: Status card with health indicator, model badge, cost display, channel list
- Styling: Dark card with green/red status dot, monospace stats

**`TaskTimeline.tsx`**

- Props: tasks[], timeRange
- Renders: Vertical timeline with colored status indicators (green=success, red=failed, yellow=running)
- Styling: Timeline with connecting line, timestamp badges, duration display

**`CostChart.tsx`**

- Props: data[] (date, tokens, cost, model), chartType (line/bar/pie)
- Renders: Recharts-based chart with responsive container
- Uses: `useTamboStreamStatus()` for loading state while chart data streams

**`SkillCard.tsx`**

- Props: skills[] (name, description, enabled, lastUsed)
- Renders: Grid of skill cards with enabled/disabled badges, last-used timestamps
- Styling: Card grid with hover effects

#### Extended Components (should have):

**`MemoryView.tsx`**

- Props: memories[] (key, summary, timestamp, relevance), query
- Renders: List of memory entries with relevance bars, timestamps, expandable summaries

**`WebhookLog.tsx`**

- Props: events[] (source, payloadSummary, timestamp, actionTaken)
- Renders: Log-style list with source icons, payload previews, action badges

**`ErrorReport.tsx`**

- Props: errors[] (message, skill, timestamp, severity, resolved)
- Renders: Error list with severity coloring (critical=red, warning=yellow, info=blue), resolved checkmarks

**`AgentStatus` enhanced** - Add `useTamboStreamStatus()` for progressive loading

#### Interactable Component (stretch):

**`CronEditor.tsx`**

- Uses `withInteractable()` HOC from Tambo
- Props: cronJobs[] (name, schedule, enabled, skill)
- Renders: Editable list with cron expression inputs, toggle switches, test-run buttons
- AI can pre-fill schedule when user says "schedule a daily task at 9am"

### 2.3 Create Component Registry

**File: `lib/tambo/components.ts`**

Export array of `TamboComponent` objects with:

- `name` - component identifier
- `description` - AI guidance (action-oriented, describes _when_ to use)
- `component` - React component reference
- `propsSchema` - Zod schema with `.describe()` on every field

### 2.4 Create Context Helpers

**File: `lib/tambo/context.ts`**

Export context helper functions:

- `agentStatus` - Returns current agent status summary (uptime, model)
- `currentTime` - Returns current ISO timestamp
- `pageContext` - Returns current page path

---

## Phase 3: Dashboard UI

### 3.1 Create Dashboard Route Group

**Directory: `app/(dashboard)/`**

**`layout.tsx`** - Server component:

- Reuses existing `ThemeProvider` and `SessionProvider` from root layout
- Adds `TamboProvider` wrapper (client component)
- Includes sidebar navigation (link back to chat, dashboard sections)

**`page.tsx`** - Main dashboard page:

- Split layout: chat thread on left, generative UI canvas on right
- Chat input at bottom of left panel
- Components render in the right panel canvas
- Welcome/greeting state when no components rendered yet

### 3.2 Create TamboWrapper Client Component

**File: `components/tambo-wrapper.tsx`**

Client component (`"use client"`) that wraps children with `TamboProvider`:

- Passes `apiKey` from env
- Passes registered components from `lib/tambo/components.ts`
- Passes registered tools from `lib/tambo/tools.ts`
- Passes context helpers from `lib/tambo/context.ts`

### 3.3 Create Dashboard Chat Components

**`components/dashboard/chat-input.tsx`**

- Uses `useTamboThreadInput()` hook
- Text input with submit button
- Shows pending state while AI responds
- Dark theme, terminal-style aesthetic

**`components/dashboard/message-thread.tsx`**

- Uses `useTamboThread()` hook
- Renders message history with user/assistant distinction
- Renders `message.renderedComponent` for AI-generated components
- Auto-scrolls to latest message

**`components/dashboard/suggestion-bar.tsx`**

- Uses `useTamboSuggestions()` hook
- Renders contextual suggestion chips above the input
- Example suggestions: "What's my agent's status?", "Show overnight activity", "Check spending"

**`components/dashboard/canvas.tsx`**

- Right-side panel that displays the latest rendered component at full size
- Falls back to welcome/empty state with suggested prompts

### 3.4 Styling

- Dark theme by default (terminal/mission-control aesthetic)
- Use existing Tailwind CSS v4 setup and CSS variables
- Use existing shadcn/ui components where possible (Card, Badge, Button)
- Add any needed CSS custom properties to `globals.css`

---

## Phase 4: Polish & Integration

### 4.1 SSE Event Feed

**File: `components/dashboard/event-feed.tsx`**

- Connects to `/api/openclaw/events` SSE endpoint
- Shows real-time events as toast notifications or a scrolling feed
- Updates relevant components when new data arrives

### 4.2 Navigation Integration

- Add dashboard link to existing sidebar (`components/app-sidebar.tsx`)
- Add breadcrumb/header showing "ClawBoard" branding

### 4.3 Streaming Status

- Add `useTamboStreamStatus()` to all generative components
- Show skeleton/loading states while props stream in
- Progressive rendering (show title before data, etc.)

### 4.4 Mock Data Quality

- Ensure mock data is realistic and varied
- Include different time ranges, error states, edge cases
- Mock data should tell a compelling story for the demo

---

## File Creation Summary

### New Files (24 files):

```
lib/openclaw/types.ts                    # Shared types
lib/openclaw/client.ts                   # Gateway client + mock data
lib/tambo/tools.ts                       # Tambo tool definitions
lib/tambo/components.ts                  # Component registry
lib/tambo/context.ts                     # Context helpers

app/api/openclaw/status/route.ts         # Agent status API
app/api/openclaw/tasks/route.ts          # Task history API
app/api/openclaw/skills/route.ts         # Skills list API
app/api/openclaw/memory/route.ts         # Memory query API
app/api/openclaw/webhook/route.ts        # Webhook trigger API
app/api/openclaw/cron/route.ts           # Cron config API
app/api/openclaw/events/route.ts         # SSE events API

components/generative/AgentStatus.tsx    # Agent health display
components/generative/TaskTimeline.tsx   # Task execution timeline
components/generative/CostChart.tsx      # Cost/token chart
components/generative/SkillCard.tsx      # Skills grid
components/generative/MemoryView.tsx     # Memory search results
components/generative/WebhookLog.tsx     # Webhook event log
components/generative/ErrorReport.tsx    # Error summary

components/dashboard/chat-input.tsx      # Tambo chat input
components/dashboard/message-thread.tsx  # Message display
components/dashboard/suggestion-bar.tsx  # AI suggestions
components/dashboard/canvas.tsx          # Component canvas

components/tambo-wrapper.tsx             # TamboProvider wrapper
app/(dashboard)/layout.tsx               # Dashboard layout
app/(dashboard)/page.tsx                 # Dashboard page
```

### Modified Files (3 files):

```
.env.local                               # Add TAMBO + OPENCLAW env vars
package.json                             # Add dependencies (via pnpm add)
components/app-sidebar.tsx               # Add dashboard nav link
```

---

## Implementation Order

1. **Install deps** (`pnpm add @tambo-ai/react recharts`)
2. **Types + Client** (`lib/openclaw/types.ts`, `lib/openclaw/client.ts`)
3. **API Routes** (all 7 routes in `app/api/openclaw/`)
4. **Generative Components** (4 core: AgentStatus, TaskTimeline, CostChart, SkillCard)
5. **Tambo Registry** (`lib/tambo/tools.ts`, `lib/tambo/components.ts`, `lib/tambo/context.ts`)
6. **Dashboard UI** (`TamboWrapper`, chat input, message thread, canvas, layout, page)
7. **Extended Components** (MemoryView, WebhookLog, ErrorReport)
8. **Polish** (suggestions, streaming status, SSE, navigation)
9. **Lint check** (`pnpm lint`)

---

## Key Decisions

1. **Separate route group** (`(dashboard)`) rather than replacing the existing chat - keeps both functional
2. **Mock data fallback** in the gateway client - demo works without OpenClaw running
3. **Reuse existing UI primitives** (shadcn/ui Card, Badge, Button) - consistent styling, less code
4. **Static Tambo registration** - pass components/tools directly to TamboProvider (simpler than dynamic)
5. **`useTamboStreamStatus()`** for all components - modern streaming approach per Tambo docs
6. **SSE for real-time** rather than WebSocket - simpler, sufficient for one-directional event feed
7. **No database changes** - ClawBoard reads from OpenClaw gateway, not from the existing Drizzle schema
