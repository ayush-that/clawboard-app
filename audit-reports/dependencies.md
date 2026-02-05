# Dependencies & Bundle Audit Report

**Date:** 2026-02-09
**Project:** ai-chatbot (ClawBoard) v3.1.0
**Package Manager:** pnpm 9.12.3

---

## Summary

| Metric | Count |
|---|---|
| Total production dependencies | 86 |
| Total dev dependencies | 17 |
| Unused production dependencies | 13 |
| Redundant / duplicate-purpose dependencies | 4 |
| Vulnerabilities found | 8 (1 high, 7 moderate) |
| Orphaned type packages (devDeps) | 3 |
| Peer-dep-only packages (could remove from package.json) | ~12 |

---

## 1. Unused Dependencies (never imported in source code)

These packages are listed in `dependencies` in `package.json` but have **no import or require** anywhere in the source code.

### Completely Unused -- Safe to Remove

| Package | Notes |
|---|---|
| `@codemirror/lang-javascript` | No import found. `@codemirror/lang-python`, `@codemirror/state`, `@codemirror/view`, `@codemirror/theme-one-dark` ARE used, but `lang-javascript` is not. |
| `codemirror` | The umbrella `codemirror` package is not imported. Individual `@codemirror/*` packages are used directly. |
| `@icons-pack/react-simple-icons` | Zero imports found. Project uses `@phosphor-icons/react` instead. |
| `@modelcontextprotocol/sdk` | Zero imports found. Likely a leftover from MCP experimentation. |
| `@radix-ui/react-icons` | Zero imports found. Not used via the `radix-ui` umbrella either. Project uses `@phosphor-icons/react`. |
| `@radix-ui/react-visually-hidden` | Zero imports. Not used via `radix-ui` umbrella either. |
| `@vercel/analytics` | Zero imports anywhere in source or layout files. |
| `embla-carousel-react` | Zero imports found. No carousel component exists in the project. |
| `react-resizable-panels` | Zero imports. No resizable panel UI component exists. |
| `react-syntax-highlighter` | Zero imports. Code highlighting uses `@streamdown/code` and `streamdown` instead. |
| `recharts` | Zero imports. No chart components exist in the project. |
| `redis` | Zero imports. No Redis client is instantiated anywhere. The `REDIS_URL` env var is documented but the client was never implemented. |
| `shiki` | Zero imports. Syntax highlighting uses other packages. |
| `zod-to-json-schema` | Zero imports. `zod` is used extensively but schema-to-JSON conversion is not needed. |

**Estimated bundle/install savings:** Removing these 14 packages would eliminate significant install weight, especially `shiki` (large WASM grammars), `recharts` (D3 dependency tree), `@icons-pack/react-simple-icons` (thousands of icon components), and `redis` (native module support).

---

## 2. Redundant / Duplicate-Purpose Dependencies

### `framer-motion` (v11.18.2) + `motion` (v12.33.0) -- DUPLICATE

`motion` is the **successor package** to `framer-motion` (renamed at v12). Both are installed:
- 7 files import from `"framer-motion"` (the old name)
- 1 file imports from `"motion/react"` (the new name)
- `motion` v12 internally re-exports `framer-motion` v12, so there are **two different versions** of the animation engine installed (v11 standalone + v12 bundled inside `motion`)

**Recommendation:** Migrate all `framer-motion` imports to `motion/react` and remove `framer-motion` from `package.json`.

### `classnames` (v2.5.1) + `clsx` (v2.1.1) -- DUPLICATE

Both packages serve the same purpose (conditional class name joining):
- `classnames` is imported in 3 files (`weather.tsx`, `image-editor.tsx`, `toolbar.tsx`)
- `clsx` is imported in `lib/utils.ts` via the `cn()` helper (used project-wide)

**Recommendation:** Remove `classnames` and replace its 3 imports with the existing `cn()` helper from `lib/utils.ts`.

---

## 3. Individual @radix-ui Packages Redundant with `radix-ui` Umbrella

The project uses BOTH the `radix-ui` umbrella package (v1.4.3) AND individual `@radix-ui/react-*` packages. The umbrella re-exports all components, making many individual packages redundant in `package.json`.

**Individual packages that are peer deps of `radix-ui` (safe to remove from package.json):**
- `@radix-ui/react-collapsible` -- used via umbrella in `components/ui/collapsible.tsx`
- `@radix-ui/react-dropdown-menu` -- used via umbrella in `components/ui/dropdown-menu.tsx`
- `@radix-ui/react-hover-card` -- used via umbrella in `components/ui/hover-card.tsx`
- `@radix-ui/react-progress` -- used via umbrella in `components/ui/progress.tsx`
- `@radix-ui/react-scroll-area` -- used via umbrella in `components/ui/scroll-area.tsx`
- `@radix-ui/react-select` -- used via umbrella in `components/ui/select.tsx`
- `@radix-ui/react-separator` -- used via umbrella in `components/ui/separator.tsx`
- `@radix-ui/react-tooltip` -- used via umbrella in `components/ui/tooltip.tsx`

**Individual packages that ARE directly imported (keep):**
- `@radix-ui/react-dialog` -- directly imported in `components/ui/dialog.tsx` and `components/ui/command.tsx`
- `@radix-ui/react-slot` -- directly imported in `components/ui/button-group.tsx`
- `@radix-ui/react-use-controllable-state` -- directly imported in 3 component files

**Recommendation:** Remove the 8 umbrella-redundant packages from `package.json`. They'll still be installed as dependencies of `radix-ui`. Or, migrate the 3 direct `@radix-ui/` imports to use the umbrella package and remove ALL individual packages.

---

## 4. Vulnerability Report

`pnpm audit` found **8 vulnerabilities** (1 high, 7 moderate):

### HIGH Severity

| Package | Vulnerability | Installed | Fix |
|---|---|---|---|
| `next` | HTTP request deserialization DoS via insecure RSC (GHSA-h25m-26qc-wcjf) | 16.0.10 | Upgrade to >=16.0.11 |

### MODERATE Severity

| Package | Vulnerability | Installed | Fix |
|---|---|---|---|
| `next` | Image Optimizer DoS (GHSA-9g9p-9gw9-jx7f) | 16.0.10 | Upgrade to >=16.1.5 |
| `next` | Unbounded Memory via PPR Resume (GHSA-5jpx-9hw9-2fx4) | 16.0.10 | Upgrade to >=16.1.5 |
| `next-auth` | Email misdelivery (GHSA-5jpx-9hw9-2fx4) | 5.0.0-beta.25 | Upgrade to >=5.0.0-beta.30 |
| `esbuild` | Dev server request vulnerability (GHSA-67mh-4wv8-2f99) | 0.18.20/0.19.12 | Upgrade to >=0.25.0 (via drizzle-kit) |
| `prismjs` | DOM Clobbering (GHSA-x7hr-w5r2-h6wg) | 1.27.0 | Upgrade to >=1.30.0 (via react-syntax-highlighter) |
| `undici` | Unbounded decompression chain (GHSA-g9mf-h72j-4rw9) | 5.29.0 | Upgrade to >=6.23.0 (via @vercel/blob) |

**Priority actions:**
1. **Upgrade `next` to >=16.1.5** -- fixes all 3 Next.js vulnerabilities
2. **Upgrade `next-auth` to >=5.0.0-beta.30** -- fixes email misdelivery
3. **Remove `react-syntax-highlighter`** -- eliminates the `prismjs` vulnerability (package is unused anyway)
4. `esbuild` and `undici` are transitive -- update `drizzle-kit` and `@vercel/blob` when new versions are available

---

## 5. Orphaned Type Packages (devDependencies)

| Type Package | Runtime Package | Issue |
|---|---|---|
| `@types/pdf-parse` | `pdf-parse` NOT in dependencies | Type package without corresponding runtime package. No `pdf-parse` import exists in source. |
| `@types/d3-scale` | `d3-scale` NOT in dependencies | Likely was needed when `recharts` was used directly. `recharts` is unused. |
| `@types/react-syntax-highlighter` | `react-syntax-highlighter` is unused | Types for an unused package. |
| `baseline-browser-mapping` | N/A | Zero references in any source file. Purpose unclear. |

**Recommendation:** Remove all 4 packages.

---

## 6. Dependency Placement Issues (deps vs devDeps)

### `dotenv` -- Could be devDependency

`dotenv` is only imported in:
- `drizzle.config.ts` (build-time config)
- `lib/db/migrate.ts` (build-time migration script)
- `lib/db/helpers/01-core-to-parts.ts` (migration helper, commented out)

Since it's only used during build/migration (not at runtime in production), it could be moved to `devDependencies`. However, since the build script runs `tsx lib/db/migrate` which uses `dotenv`, keeping it in `dependencies` is harmless and ensures it works in CI.

**Verdict:** Low priority. Current placement is acceptable.

---

## 7. Large / Heavy Dependencies Worth Noting

These are used but are notably large and could be evaluated for lighter alternatives:

| Package | Concern |
|---|---|
| `@xyflow/react` | 1.1MB+ with all dependencies. Used for flow diagrams. Only imported in 7 files. Ensure tree-shaking is working. |
| `@phosphor-icons/react` | Large icon library (thousands of icons). Only ~20 icons are actually imported. Consider using individual icon imports if the package doesn't tree-shake well. |
| `prosemirror-*` (8 packages) | Rich text editor foundation. All are used in `lib/editor/` and `components/`. Necessary for the text editor feature. |
| `katex` | Math rendering library. Only referenced via CSS import (`@import "katex/dist/katex.min.css"`). If math rendering is not a core feature, this could be lazy-loaded. |

---

## 8. Notable Observations

### Both `framer-motion` AND `motion` installed
This results in **two versions of the same animation engine** being bundled. The `motion` package (v12) internally bundles `framer-motion` v12, while the standalone `framer-motion` v11 is also installed. This approximately **doubles the animation library bundle size**.

### Icon library sprawl
Three icon packages are installed:
1. `@phosphor-icons/react` -- actively used (3+ files)
2. `@icons-pack/react-simple-icons` -- **unused**
3. `@radix-ui/react-icons` -- **unused**

**Recommendation:** Remove the two unused icon packages.

### `next-auth` on beta
`next-auth@5.0.0-beta.25` is a pre-release version with a known vulnerability. Stable v5 should be used when available, or update to at least `beta.30` to fix the email misdelivery vulnerability.

---

## 9. Cleanup Recommendations (Priority Order)

### High Priority (security + bundle size)
1. Upgrade `next` from 16.0.10 to >=16.1.5 (fixes 3 CVEs)
2. Upgrade `next-auth` from 5.0.0-beta.25 to >=5.0.0-beta.30 (fixes 1 CVE)
3. Remove `framer-motion` and migrate to `motion/react` imports (eliminates duplicate animation engine)

### Medium Priority (unused dependency cleanup)
4. Remove 14 unused packages: `@codemirror/lang-javascript`, `codemirror`, `@icons-pack/react-simple-icons`, `@modelcontextprotocol/sdk`, `@radix-ui/react-icons`, `@radix-ui/react-visually-hidden`, `@vercel/analytics`, `embla-carousel-react`, `react-resizable-panels`, `react-syntax-highlighter`, `recharts`, `redis`, `shiki`, `zod-to-json-schema`
5. Remove `classnames` and use existing `cn()` helper (from `clsx`) in the 3 affected files
6. Remove 8 redundant individual `@radix-ui/react-*` packages (covered by `radix-ui` umbrella)
7. Remove orphaned devDeps: `@types/pdf-parse`, `@types/d3-scale`, `@types/react-syntax-highlighter`, `baseline-browser-mapping`

### Low Priority (nice to have)
8. Move `@opentelemetry/api` and `@opentelemetry/api-logs` to peer dependency documentation (they're peer deps of `@vercel/otel` and `ai`, not directly imported)
9. Evaluate lazy-loading `katex` CSS if math rendering is rare
10. Audit `@phosphor-icons/react` imports for tree-shaking efficiency
