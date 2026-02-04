# Skeleton Removal Tracker

## Goal
Remove ALL skeleton loaders, loading placeholders, and animate-pulse loading states from the app. Content renders when it's ready — no intermediate loading UI.

## Agent Assignments

| Agent | Scope | Files | Status |
|-------|-------|-------|--------|
| nuker-dashboard-tabs | All 8 dashboard tab LoadingSkeletons | logs-tab, sessions-tab, skills-tab, usage-tab, cron-tab, channels-tab, config-tab, settings-tab | Done |
| nuker-chat-pages | Chat Suspense fallbacks + ChatSkeleton file | page.tsx (x2), layout.tsx, chat-skeleton.tsx (deleted) | Done |
| nuker-artifacts | Document skeleton, document-preview, artifact loaders | document-skeleton.tsx (deleted), document-preview.tsx, artifacts/text/client.tsx, artifact.tsx | Done |
| nuker-misc | Sidebar and other inline animate-pulse | sidebar-user-nav.tsx, sidebar-history.tsx | Done |

## NOT removing (functional, not loading UI)
- `components/ui/skeleton.tsx` — shadcn primitive, keep the file but it'll be unused
- `components/ui/sidebar.tsx` — SidebarMenuSkeleton is a shadcn export, don't touch
- `components/elements/tool.tsx` / `ai-elements/tool.tsx` — `animate-pulse` on clock icon is a status indicator, not a loader
- `components/ai-elements/prompt-input.tsx` — `animate-pulse` on listening state is functional
- `components/message.tsx` line 377/384 — "Thinking" indicator during AI reasoning — this is streaming state, not a loader
