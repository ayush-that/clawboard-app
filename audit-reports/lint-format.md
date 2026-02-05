# Lint & Formatting Compliance Audit

**Date:** 2026-02-09
**Tool:** Biome via Ultracite v7.1.4
**Config:** `biome.jsonc` extending `ultracite/biome/core`, `ultracite/biome/next`, `ultracite/biome/react`

---

## Executive Summary

| Metric | Value |
|---|---|
| Total source files (TS/TSX/JS/JSX) | 221 |
| Files checked by linter | 213 |
| Files excluded from linting | 28 (26 in `components/ui/`, `lib/utils.ts`, `hooks/use-mobile.ts`) |
| **Lint violations** | **0** |
| **Formatting violations** | **0** |
| `biome-ignore` suppressions | 13 |
| Stale `eslint-disable` comments | 5 |
| `@ts-expect-error` comments | 3 (2 commented-out, 1 active) |
| Pre-commit hook enforcing lint | None |
| CI workflow enforcing lint | None |

**Overall Status: PASS** -- The codebase is fully lint-clean and formatting-compliant. No active violations were found across all 213 checked files.

---

## 1. Lint Results

```
$ pnpm lint
> ultracite check
Checked 213 files in 79ms. No fixes applied.
```

**Zero violations.** All 213 linted source files pass the full Biome rule set.

### Formatting Check

```
$ npx @biomejs/biome format .
Checked 213 files in 24ms. No fixes applied.
```

**Zero formatting changes needed.** All files are consistently formatted.

---

## 2. Configuration Analysis

### 2.1 Base Configuration

The project extends three Ultracite presets:
- `ultracite/biome/core` -- 150+ rules covering correctness, style, complexity, a11y, security, performance
- `ultracite/biome/next` -- Next.js-specific rules (no `<img>`, no `<head>`, etc.)
- `ultracite/biome/react` -- React-specific rules (hooks, JSX best practices)

### 2.2 Rules Disabled (Relaxed from Ultracite Defaults)

| Rule | Category | Risk |
|---|---|---|
| `noExplicitAny` | suspicious | **Medium** -- allows `any` types, weakens type safety |
| `noConsole` | suspicious | **Low** -- appropriate for a dashboard app with logging |
| `noBitwiseOperators` | suspicious | **Low** -- may be needed for specific use cases |
| `noMagicNumbers` | style | **Low** -- pragmatic for UI code |
| `noNestedTernary` | style | **Low** -- stylistic preference |
| `useConsistentTypeDefinitions` | style | **Low** -- allows both `type` and `interface` |
| `noUnnecessaryConditions` | nursery | **Low** -- nursery rule, still unstable |
| `useSortedClasses` | nursery | **Low** -- Tailwind class sorting, not critical |
| `noExcessiveCognitiveComplexity` | complexity | **Medium** -- no limit on function complexity |
| `useSimplifiedLogicExpression` | complexity | **Low** -- stylistic |
| `noSvgWithoutTitle` | a11y | **Low** -- decorative SVGs common |
| `useUniqueElementIds` | correctness | **Low** -- may cause false positives |
| `useImageSize` | correctness | **Low** -- Next.js Image handles this |
| `noBarrelFile` | performance | **Low** -- barrel files used for API organization |
| `useTopLevelRegex` | performance | **Low** -- pragmatic for inline regex |

**Assessment:** The disabled rules are reasonable and well-justified. The most impactful is `noExplicitAny` being off, which reduces type safety guardrails (see Type Safety audit). `noExcessiveCognitiveComplexity` being off means there is no upper bound on function complexity.

### 2.3 Files Excluded from Linting

| Path | Files | Lines | Reason |
|---|---|---|---|
| `components/ui/` | 26 | ~2,820 | Auto-generated shadcn/ui primitives |
| `lib/utils.ts` | 1 | 116 | Utility functions (likely shadcn) |
| `hooks/use-mobile.ts` | 1 | 19 | Generated hook |
| `node_modules/` | -- | -- | Standard exclusion |
| `.next/` | -- | -- | Build output |
| `ai-sdk/` | 0 | 0 | Listed but directory does not exist |

**Total excluded:** ~2,955 lines across 28 files. This is appropriate -- `components/ui/` contains auto-generated shadcn/ui components that would conflict with some lint rules.

**Note:** `ai-sdk/` is listed in exclusions but the directory does not exist. This is a dead exclusion entry.

---

## 3. Inline Suppressions

### 3.1 `biome-ignore` Directives (13 total)

| File | Rule Suppressed | Reason Given |
|---|---|---|
| `drizzle.config.ts:13` | `lint` (generic) | "Forbidden non-null assertion" |
| `lib/editor/react-renderer.tsx:3` | `complexity/noStaticOnlyClass` | "Needs to be static" |
| `lib/db/queries.ts:44` | `lint` (generic) | "Forbidden non-null assertion" |
| `app/layout.tsx:77` | `security/noDangerouslySetInnerHtml` | "Required" |
| `app/(auth)/login/page.tsx:66` | `correctness/useExhaustiveDependencies` | "router and updateSession are stable refs" |
| `app/(auth)/register/page.tsx:65` | `correctness/useExhaustiveDependencies` | "router and updateSession are stable refs" |
| `app/(chat)/actions.ts:18` | `suspicious/useAwait` | "Server Actions must be async" |
| `components/ai-elements/image.tsx:15` | `performance/noImgElement` | "base64 data URLs require native img" |
| `components/ai-elements/message.tsx:351` | `performance/noImgElement` | "dynamic user-uploaded images" |
| `components/ai-elements/prompt-input.tsx:313` | `performance/noImgElement` | "dynamic user uploads" |
| `components/ai-elements/prompt-input.tsx:349` | `performance/noImgElement` | "dynamic user uploads" |
| `components/ai-elements/queue.tsx:154` | `performance/noImgElement` | "dynamic blob/data URLs require native img" |
| `components/elements/image.tsx:15` | `performance/noImgElement` | "base64 data URLs require native img" |

**Assessment:**
- All suppressions have justification comments (good practice)
- 2 use generic `lint` instead of specifying the exact rule name -- should be specific
- 5 suppress `noImgElement` for dynamic/data URLs -- valid reason, Next.js `<Image>` cannot handle these
- 2 suppress `useExhaustiveDependencies` for stable framework refs -- valid
- 1 suppresses `noDangerouslySetInnerHtml` in layout -- needs careful security review
- 1 suppresses `useAwait` for Next.js Server Actions -- valid pattern

### 3.2 Stale `eslint-disable` Comments (5 total)

These comments have **no effect** since the project uses Biome, not ESLint:

| File | Comment |
|---|---|
| `hooks/use-auto-resume.ts:35` | `// eslint-disable-next-line react-hooks/exhaustive-deps` |
| `components/multimodal-input.tsx:111` | `// eslint-disable-next-line react-hooks/exhaustive-deps` |
| `components/code-editor.tsx:44` | `// eslint-disable-next-line` |
| `components/text-editor.tsx:76` | `// eslint-disable-next-line` |
| `components/ai-elements/prompt-input.tsx:681` | `// eslint-disable-next-line react-hooks/exhaustive-deps` |

**Impact:** These are dead comments. They do not suppress any Biome rules and should be removed or converted to `biome-ignore` directives if the suppression is still needed.

### 3.3 TypeScript Directive Comments (3 total)

| File | Line | Type | Status |
|---|---|---|---|
| `lib/db/helpers/01-core-to-parts.ts:146` | `@ts-expect-error` | Commented out (inactive) |
| `lib/db/helpers/01-core-to-parts.ts:162` | `@ts-expect-error` | Commented out (inactive) |
| `artifacts/code/client.tsx:136` | `@ts-expect-error` | Active -- `loadPyodide is not defined` |

**Note:** No `@ts-ignore` directives found anywhere (good -- Biome's `noTsIgnore` rule is enforced).

---

## 4. Enforcement Gaps

### 4.1 No Pre-Commit Hook

There is no pre-commit hook (no Husky, no lint-staged) to enforce linting before commits. Developers can push unlinted code.

**Risk: Medium** -- Relies entirely on developer discipline.

### 4.2 No CI Pipeline

No `.github/workflows/` directory exists. There is no CI enforcement of lint rules on pull requests.

**Risk: High** -- Nothing prevents lint regressions from being merged.

### 4.3 No ESLint Config (Correct)

The project correctly has no ESLint configuration at the project root. All linting is handled by Biome via Ultracite. The stale `eslint-disable` comments (see section 3.2) are remnants from a previous setup.

---

## 5. Formatter Configuration

| Setting | Value | Notes |
|---|---|---|
| Indent style | `space` | Consistent with Ultracite default |
| Indent width | `2` | Standard for JS/TS projects |
| Line ending | `lf` | Set by Ultracite core |
| Line width | `80` | Set by Ultracite core |
| Arrow parentheses | `always` | Set by Ultracite core |
| JSX quote style | `double` | Set by Ultracite core |
| Semicolons | `always` | Set by Ultracite core |
| Trailing commas | `es5` | Set by Ultracite core |
| Bracket spacing | `true` | Set by Ultracite core |

**Assessment:** Formatter settings are fully inherited from Ultracite with only indent style/width overridden. All 213 files comply.

---

## 6. Recommendations

### Priority 1 (Should Fix)

1. **Add CI lint enforcement** -- Create a GitHub Actions workflow that runs `pnpm lint` on pull requests. Without this, lint regressions can be merged silently.

2. **Add pre-commit hook** -- Install Husky + lint-staged to run `pnpm lint` on staged files before commit. This catches issues before they reach the repository.

3. **Remove stale `eslint-disable` comments** (5 files) -- These comments serve no purpose with Biome. If the suppressions are still needed, convert them to `biome-ignore` with justification. If not, remove them.

### Priority 2 (Should Improve)

4. **Use specific rule names in `biome-ignore`** -- Two suppressions use generic `// biome-ignore lint:` instead of specifying the exact rule. Change to `// biome-ignore lint/style/noNonNullAssertion:` for clarity.

5. **Remove dead `ai-sdk/` exclusion** -- The `ai-sdk/` directory does not exist. Remove it from `files.includes` in `biome.jsonc` to keep config clean.

6. **Review `noDangerouslySetInnerHtml` suppression** in `app/layout.tsx` -- Ensure the injected HTML is sanitized or comes from a trusted source.

### Priority 3 (Consider)

7. **Re-enable `noExcessiveCognitiveComplexity`** with a higher threshold (e.g., 30 or 40) rather than disabling entirely. This prevents unbounded function complexity from accumulating.

8. **Consider enabling `noExplicitAny`** at warn level to gradually improve type safety without blocking development.

---

## 7. File Coverage Summary

| Category | Count | % |
|---|---|---|
| Total source files | 221 | 100% |
| Linted by Biome | 213 | 96.4% |
| Excluded (shadcn/ui + utils) | 8 | 3.6% |
| Clean (0 violations) | 213 | 100% of linted |
| Files with suppressions | 12 | 5.6% of linted |

---

*Report generated by lint-format-auditor agent*
