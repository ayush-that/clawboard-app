# Build & Project Structure Audit

**Date:** 2026-02-09
**Auditor:** Build & Structure Agent
**Scope:** Build health, directory organization, configuration correctness, orphaned files

---

## 1. Build Status

**Result: PASS**

`pnpm build` completes successfully (compilation in ~5.8s, static generation in ~659ms).

### Build Output Summary
- **30 routes** generated (static, dynamic, and partial prerender)
- **TypeScript check:** Passed
- **Static pages:** 30/30 generated successfully
- **Next.js version:** 16.0.10 (Turbopack, Cache Components)

### Build Warnings (2 categories)

| Warning | Count | Severity |
|---------|-------|----------|
| Drizzle migration schema/table already exists (NOTICE) | 2 | Low - informational, expected on repeat builds |
| `baseline-browser-mapping` data over two months old | ~14 | Low - cosmetic, no functional impact |

**Recommendation:** Update `baseline-browser-mapping` devDependency to silence the repeated warning:
```
pnpm add -D baseline-browser-mapping@latest
```

---

## 2. Directory Structure Assessment

### Top-Level Layout

```
clawboard-app/
  app/              # Next.js App Router routes
  artifacts/        # Client-side artifact renderers (code, image, sheet, text)
  components/       # React components (including dashboard, UI, generative, ai-elements)
  hooks/            # Custom React hooks (6 hooks)
  lib/              # Shared logic (AI, DB, OpenClaw, security, tambo, editor)
  public/           # Static assets (favicons, manifest, images)
  tests/            # Test utilities (minimal)
  audit-reports/    # Audit output (this report)
```

**Assessment: GOOD** -- Clean separation of concerns. Standard Next.js App Router conventions followed.

### Route Groups

| Route Group | Purpose | Routes |
|-------------|---------|--------|
| `app/(auth)/` | Authentication (login, register, NextAuth) | 4 files |
| `app/(chat)/` | Chat UI, API routes (chat, document, files, history, suggestions) | 11 files |
| `app/api/openclaw/` | OpenClaw gateway bridge API routes | 13 route files |
| `app/api/settings/` | User settings API | 1 route file |

### Component Organization

| Directory | File Count | Purpose |
|-----------|-----------|---------|
| `components/ui/` | 20 files | shadcn/ui primitives (auto-generated, excluded from lint) |
| `components/ai-elements/` | 21 files | AI-specific UI elements |
| `components/dashboard/tabs/` | 9 tab files | Dashboard tab views |
| `components/dashboard/` | 1 overlay file | ExecApprovalOverlay |
| `components/generative/` | 8 files | Generative UI components (Tambo) |
| `components/elements/` | 6 files | Reusable message/display elements |
| `components/` (root) | ~20 files | Core app components |

### Issues Found

#### 2.1 Missing `middleware.ts` -- Severity: HIGH

The project has `proxy.ts` at root exporting a `proxy()` function and a `config` object, but **no `middleware.ts`** file exists. Next.js requires `middleware.ts` (or `middleware.js`) at the project root for middleware to function. The `proxy.ts` file is **never imported** anywhere in the codebase.

**Impact:** Authentication middleware may not be running. The exported `proxy` function and route matcher config have no effect without being re-exported from `middleware.ts`.

**Recommendation:** Either:
- Rename `proxy.ts` to `middleware.ts` and rename the exported function from `proxy` to `middleware`
- Or create `middleware.ts` that re-exports from `proxy.ts`

#### 2.2 `event-feed.tsx` Referenced in Memory but Missing -- Severity: LOW

The project memory references `components/dashboard/event-feed.tsx` (SSE event feed bar) but this file does not exist. Either it was removed or never created.

**Impact:** No functional impact if the feature was intentionally deferred, but documentation is stale.

#### 2.3 `firebase-debug.log` Not Gitignored -- Severity: LOW

A 268-line `firebase-debug.log` file exists at root and is not in `.gitignore`. The `.gitignore` has `.firebase/` but not `firebase-debug.log`.

**Recommendation:** Add `firebase-debug.log` to `.gitignore`.

#### 2.4 Dashboard Route Group Missing -- Severity: INFORMATIONAL

The project memory references `app/(dashboard)/dashboard/` as a route group, but no such directory exists. The dashboard is actually rendered via `MainContentSwitcher` in the chat layout using a context-based view switch (`ActiveViewProvider`) rather than a separate route group. This is a valid architectural choice but the documentation is misleading.

---

## 3. Configuration Analysis

### 3.1 `package.json`

**Status: MOSTLY GOOD** with issues:

| Issue | Severity | Detail |
|-------|----------|--------|
| `test` script is a no-op | Medium | `"test": "echo 'No tests configured'"` -- Playwright was the original test runner but the script was replaced |
| Duplicate CSS utility libraries | Low | Both `classnames` and `clsx` are dependencies. `classnames` is used in 3 files, `clsx` in 1 (via `lib/utils.ts`). Pick one. |
| Both `framer-motion` and `motion` installed | Low | `framer-motion` is the legacy package name; `motion` is the modern rebranding. Only `framer-motion` is imported (8 files). `motion` package appears unused. |
| `@ai-sdk/openai` may be unused | Low | Listed as dependency but code uses `@ai-sdk/gateway` for all model access. Verify if `@ai-sdk/openai` is directly imported anywhere. |
| `@types/pdf-parse` without `pdf-parse` | Low | Type definitions for a package that isn't in dependencies |
| `next-auth` beta version | Medium | Using `5.0.0-beta.25` -- beta versions in production carry stability risk |

### 3.2 `tsconfig.json`

**Status: GOOD**

- `strict: true` and `strictNullChecks: true` -- proper type safety
- `jsx: "react-jsx"` -- correct for React 19
- `moduleResolution: "bundler"` -- correct for Next.js 16
- `paths` alias `@/*` correctly configured
- `incremental: true` for faster rebuilds
- `noEmit: true` -- correct for Next.js (bundler handles output)

**Minor note:** `include` references `next.config.js` but the actual file is `next.config.ts`. This is harmless as TypeScript's `**/*.ts` glob already covers it.

### 3.3 `next.config.ts`

**Status: GOOD**

- `cacheComponents: true` -- enables Component Cache (Next.js 16 feature)
- Image remote patterns configured for Vercel avatars and blob storage
- Minimal config with no unnecessary complexity

**Missing:** No `serverExternalPackages` configuration. If `postgres` driver or other native modules cause issues in serverless, this may need attention.

### 3.4 `biome.jsonc`

**Status: GOOD**

- Properly extends Ultracite presets (core, next, react)
- Reasonable rule overrides documented
- File exclusions match project conventions (`components/ui`, `lib/utils.ts`, etc.)
- `useUniqueElementIds` and `useImageSize` disabled (likely needed for dynamic content)

### 3.5 `drizzle.config.ts`

**Status: GOOD**

- Schema and migration paths correctly configured
- PostgreSQL dialect
- Uses `.env.local` for credentials
- Has biome-ignore comment for non-null assertion (acceptable in config)

### 3.6 `postcss.config.mjs`

**Status: GOOD** -- Minimal Tailwind CSS v4 PostCSS config.

### 3.7 `components.json`

**Status: GOOD** -- Standard shadcn/ui configuration with correct alias mappings.

---

## 4. Environment Variables

### `.env.example` Coverage

| Variable | In `.env.example` | Used In Code | Status |
|----------|-------------------|-------------|--------|
| `AUTH_SECRET` | Yes | `proxy.ts` | OK |
| `AI_GATEWAY_API_KEY` | Yes | Not directly in app code (used by AI SDK) | OK |
| `BLOB_READ_WRITE_TOKEN` | Yes | Not directly in app code (used by Vercel Blob) | OK |
| `POSTGRES_URL` | Yes | `lib/db/queries.ts`, `lib/db/migrate.ts`, `drizzle.config.ts` | OK |
| `USER_SETTINGS_ENCRYPTION_KEY` | Yes | `lib/security/user-settings-crypto.ts` | OK |
| `REDIS_URL` | Yes | `app/(chat)/api/chat/route.ts` | OK |
| `NEXT_PUBLIC_TAMBO_API_KEY` | Yes (deprecated note) | Not in app code (deprecated) | OK |
| `OPENCLAW_GATEWAY_URL` | Yes | `lib/openclaw/settings.ts` | OK |
| `OPENCLAW_GATEWAY_TOKEN` | Yes | `lib/openclaw/settings.ts` | OK |
| `NODE_ENV` | No (set by runtime) | `lib/constants.ts` | OK -- standard |
| `PLAYWRIGHT_TEST_BASE_URL` | No | `lib/constants.ts` | Minor -- test-only, acceptable to omit |

**Assessment: GOOD** -- All required env vars are documented. Deprecated vars are marked.

---

## 5. Orphaned / Suspect Files

| File | Issue | Severity |
|------|-------|----------|
| `proxy.ts` | Not imported anywhere; appears to be an unused middleware file | HIGH |
| `firebase-debug.log` | Debug log committed to repo (268 lines, 44KB) | LOW |
| `lib/db/helpers/01-core-to-parts.ts` | Contains commented-out migration code | LOW |
| `motion` package | Installed but never imported | LOW |
| `@types/pdf-parse` | Types for uninstalled package | LOW |

---

## 6. Database Migrations

**Status: GOOD**

- 11 migration files (0000-0010) with corresponding snapshot metadata
- Journal file present at `meta/_journal.json`
- Migration runner (`lib/db/migrate.ts`) properly validates `POSTGRES_URL` before running
- Build script runs migrations before `next build` -- correct ordering

---

## 7. Recommendations Summary

### Critical (should fix)
1. **Fix middleware:** `proxy.ts` is not functioning as middleware. Rename to `middleware.ts` or create a `middleware.ts` that imports and re-exports it.

### High Priority
2. **Restore test script:** Replace no-op `test` script with Playwright or other test runner configuration.

### Medium Priority
3. **Consolidate CSS utilities:** Choose either `classnames` or `clsx`, not both.
4. **Remove unused `motion` package:** Only `framer-motion` is imported.
5. **Remove `@types/pdf-parse`:** No corresponding runtime package.
6. **Evaluate `next-auth` beta risk:** Consider stability implications of beta in production.

### Low Priority
7. **Add `firebase-debug.log` to `.gitignore`.**
8. **Update `baseline-browser-mapping`** to silence build warnings.
9. **Clean up `lib/db/helpers/01-core-to-parts.ts`** -- remove if migration is complete.
10. **Update project documentation** to reflect actual dashboard architecture (context-based view switching, not route group).

---

## 8. Overall Score

| Category | Score | Notes |
|----------|-------|-------|
| Build Health | 9/10 | Builds successfully, minor warnings |
| Directory Structure | 8/10 | Clean layout, minor documentation drift |
| Configuration | 7/10 | Middleware issue, some dep redundancy |
| Env Var Management | 9/10 | Well-documented, deprecation noted |
| Documentation | 6/10 | Memory/docs reference non-existent files and wrong paths |

**Overall: 7.8/10** -- The project builds cleanly and has good structural organization. The main concern is the non-functional middleware (`proxy.ts`) which could mean authentication is not being enforced on routes. Secondary concerns are minor dependency hygiene issues and stale documentation.
