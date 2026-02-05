# Security Audit Report

**Project:** ClawBoard (clawboard-app)
**Date:** 2026-02-09
**Auditor:** Security Auditor (automated)
**Scope:** All source files in `app/`, `lib/`, `components/`, `middleware`, and dependency audit

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1     |
| High     | 5     |
| Medium   | 6     |
| Low      | 4     |
| **Total**| **16**|

---

## Critical Findings

### SEC-01: Server-Side Request Forgery (SSRF) via User-Controlled Gateway URL

- **File:** `lib/openclaw/client.ts:46`, `lib/openclaw/client.ts:82`
- **Also:** `lib/openclaw/settings.ts:14-17`, `app/api/settings/route.ts:65-90`
- **OWASP:** A10:2021 - Server-Side Request Forgery
- **Description:** Users can set their own `openclawGatewayUrl` via the Settings API (`PATCH /api/settings`). This URL is then used directly in server-side `fetch()` calls (`lib/openclaw/client.ts:46` and `:82`) to construct request targets: `${url}/tools/invoke` and `${url}/v1/chat/completions`. While the settings route validates that the URL uses `http:` or `https:` protocol, there is no restriction on the target hostname or IP. An attacker could set the gateway URL to `http://169.254.169.254` (AWS metadata), `http://localhost:xxxx`, or any internal service, using the server as a proxy to scan and access internal infrastructure.
- **Exploitation Risk:** HIGH. An authenticated user can probe internal network services, access cloud metadata endpoints, and exfiltrate internal data through the server.
- **Fix Recommendation (P0):**
  - Implement a URL allowlist or blocklist that prevents requests to private/internal IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.x.x.x, 169.254.x.x, ::1, fd00::/8).
  - Resolve the hostname before making the request and validate the resolved IP is not in a private range.
  - Consider restricting the gateway URL to specific domains or patterns.

---

## High Findings

### SEC-02: Vulnerable Dependencies with Known CVEs

- **Source:** `pnpm audit` output
- **OWASP:** A06:2021 - Vulnerable and Outdated Components
- **Findings:**
  1. **next@16.0.10** (HIGH): HTTP request deserialization DoS via insecure React Server Components (GHSA-h25m-26qc-wcjf). Patched in >=16.0.11.
  2. **next-auth@5.0.0-beta.25** (MODERATE): Email misdelivery vulnerability (GHSA-5jpx-9hw9-2fx4). Patched in >=5.0.0-beta.30.
  3. **esbuild@0.18.20/0.19.12** (MODERATE): Dev server allows any website to read responses (GHSA-67mh-4wv8-2f99). Patched in >=0.25.0.
  4. **prismjs@1.27.0** (MODERATE): DOM Clobbering vulnerability (GHSA-x7hr-w5r2-h6wg). Patched in >=1.30.0.
  5. **undici** (MODERATE): Unbounded decompression chain DoS via Content-Encoding.
- **Exploitation Risk:** HIGH for next.js DoS; MODERATE for the others.
- **Fix Recommendation (P0):**
  - Upgrade `next` to >=16.0.11 immediately.
  - Upgrade `next-auth` to >=5.0.0-beta.30.
  - Upgrade `react-syntax-highlighter` or override `prismjs` to >=1.30.0.

### SEC-03: No Rate Limiting on API Endpoints

- **Files:** All routes in `app/api/openclaw/*/route.ts`, `app/api/settings/route.ts`, `app/(chat)/api/files/upload/route.ts`, `app/(chat)/api/document/route.ts`, `app/(chat)/api/history/route.ts`, `app/(chat)/api/suggestions/route.ts`
- **OWASP:** A04:2021 - Insecure Design
- **Description:** The only rate limiting in the application is on the chat endpoint (`app/(chat)/api/chat/route.ts:77-84`), which limits messages per 24-hour window. All other API endpoints (14+ routes for OpenClaw, settings, documents, file uploads, history) have no rate limiting whatsoever. This includes state-modifying endpoints like `POST /api/openclaw/webhook`, `POST /api/openclaw/cron`, `PATCH /api/openclaw/config`, and `POST /api/files/upload`.
- **Exploitation Risk:** HIGH. Attackers can flood the server with requests, abuse the gateway proxy for SSRF amplification, exhaust blob storage via file uploads, or perform denial-of-service attacks.
- **Fix Recommendation (P1):**
  - Implement middleware-level rate limiting (e.g., using Redis-backed token bucket or sliding window).
  - At minimum, rate limit file uploads, webhook triggers, and settings mutations.

### SEC-04: Exposed Error Details in Production Responses

- **Files:** `app/api/openclaw/approvals/route.ts:22-24`, `app/api/openclaw/config/route.ts:22-25`, `app/api/openclaw/cron/route.ts:27-30`, `app/api/openclaw/logs/route.ts:22-24`, `app/api/openclaw/memory/route.ts:23-26`, `app/api/openclaw/sessions/route.ts:21-24`, `app/api/openclaw/webhook-events/route.ts:22-25`, `app/api/settings/route.ts:31-34`, `app/api/settings/route.ts:109-112`
- **OWASP:** A05:2021 - Security Misconfiguration
- **Description:** Multiple API routes return `String(error)` in their JSON responses, e.g., `{ error: "Gateway unreachable", message: String(error) }`. The `String(error)` call serializes the full error message, which may include internal stack traces, gateway URLs, database connection strings, or other sensitive internal details. Similarly, `app/api/settings/route.ts` returns `{ error: "Database error", message: String(error) }` which could leak Postgres connection details.
- **Exploitation Risk:** MEDIUM. Information leakage helps attackers map internal infrastructure.
- **Fix Recommendation (P1):**
  - Never expose raw error messages to clients in production.
  - Log the full error server-side but return only generic messages to the client.
  - Use the existing `ChatSDKError` pattern which properly hides database errors.

### SEC-05: File Upload Path Traversal Risk

- **File:** `app/(chat)/api/files/upload/route.ts:50-56`
- **OWASP:** A01:2021 - Broken Access Control
- **Description:** The upload route uses the client-provided filename directly as the blob storage key: `await put(\`${filename}\`, fileBuffer, { access: "public" })`. The filename comes from `(formData.get("file") as File).name` with no sanitization. While Vercel Blob storage may handle this safely, the filename is not validated against path traversal characters (`../`, `..\\`), special characters, or excessively long names. Additionally, files are uploaded with `access: "public"`, making them publicly accessible to anyone with the URL.
- **Exploitation Risk:** MEDIUM. The primary risk is filename-based attacks against blob storage and all uploaded files being publicly accessible.
- **Fix Recommendation (P1):**
  - Sanitize or replace the filename with a server-generated UUID.
  - Consider using `access: "private"` if files should not be publicly accessible.
  - Validate filename length and characters.

### SEC-06: No CORS Configuration

- **Files:** No `middleware.ts` at project root, no CORS headers in any API route
- **OWASP:** A05:2021 - Security Misconfiguration
- **Description:** There is no custom middleware.ts at the project root, and no API routes set CORS headers. While Next.js has some default protections (same-origin for API routes when deployed on Vercel), the application lacks explicit CORS policy. This means the API behavior depends entirely on the deployment platform defaults and could be misconfigured in non-Vercel deployments.
- **Exploitation Risk:** MEDIUM in non-Vercel deployments. Cross-origin requests may succeed if the app is deployed to a platform without default CORS restrictions.
- **Fix Recommendation (P1):**
  - Add a `middleware.ts` at the project root with explicit CORS configuration.
  - At minimum, restrict API routes to same-origin requests.

---

## Medium Findings

### SEC-07: Weak Password Policy

- **File:** `app/(auth)/actions.ts:11`
- **OWASP:** A07:2021 - Identification and Authentication Failures
- **Description:** The password validation schema only requires `z.string().min(6)`. There are no requirements for complexity (uppercase, lowercase, digits, special characters), no maximum length validation, and no check against common/breached passwords.
- **Exploitation Risk:** MEDIUM. Weak passwords are susceptible to brute-force and credential stuffing attacks.
- **Fix Recommendation (P2):**
  - Enforce a minimum of 8 characters with complexity requirements.
  - Add maximum length validation (e.g., 128 chars) to prevent DoS via bcrypt.
  - Consider checking passwords against the HaveIBeenPwned API.

### SEC-08: Missing Input Validation on OpenClaw API Routes

- **Files:** `app/api/openclaw/cron/route.ts:36-41`, `app/api/openclaw/memory/route.ts:32`, `app/api/openclaw/config/route.ts:31-34`
- **OWASP:** A03:2021 - Injection
- **Description:** Several OpenClaw API routes accept request bodies via `request.json() as { ... }` with TypeScript type assertions but no runtime validation (no Zod schemas). The cron POST accepts `{ name, schedule, message }`, the memory POST accepts `{ text }`, and the config PATCH accepts `{ patch, hash }` -- all without validating the actual shape or content of the data. Malformed or malicious input is passed directly to the gateway client.
- **Exploitation Risk:** MEDIUM. While the gateway should validate its own inputs, passing unvalidated data increases the attack surface.
- **Fix Recommendation (P2):**
  - Add Zod schemas for all API route request bodies (follow the pattern already used in `app/(chat)/api/chat/schema.ts`).
  - Validate and sanitize inputs before forwarding to the gateway.

### SEC-09: Module-Level Cached Session Key Without Expiration

- **File:** `lib/openclaw/client.ts:223-238`
- **OWASP:** A04:2021 - Insecure Design
- **Description:** The `cachedSessionKey` variable is a module-level `let` that caches the primary gateway session key indefinitely: `let cachedSessionKey: string | undefined;`. Once set, it never expires or gets invalidated. In a serverless environment this is less concerning, but in a long-running server (e.g., development or custom deployment), a stale session key could cause authorization issues or reference the wrong session.
- **Exploitation Risk:** LOW-MEDIUM. Could cause authorization bypass or incorrect session usage in long-running processes.
- **Fix Recommendation (P2):**
  - Add TTL-based expiration to the cache (e.g., 5-minute timeout).
  - Or remove the cache and fetch the session key on each request.

### SEC-10: Permissive Zod Schema for Tool Approval Messages

- **File:** `app/(chat)/api/chat/schema.ts:24-28`
- **OWASP:** A03:2021 - Injection
- **Description:** The `messageSchema` used for tool approval flows uses `z.array(z.any())` for the `parts` field and `z.string()` for `role` and `id` (not UUID-validated). This is significantly more permissive than the `userMessageSchema` and allows arbitrary data to be injected via the parts array.
- **Exploitation Risk:** MEDIUM. Arbitrary content in parts could be used for prompt injection or data manipulation.
- **Fix Recommendation (P2):**
  - Tighten the schema to only accept known part types.
  - Validate roles against an allowed set (user, assistant, system, tool).

### SEC-11: No Account Lockout on Failed Login Attempts

- **File:** `app/(auth)/auth.ts:43-65`, `app/(auth)/actions.ts:18-41`
- **OWASP:** A07:2021 - Identification and Authentication Failures
- **Description:** The login flow returns `null` on failed authentication but does not track failed attempts. There is no account lockout mechanism, no progressive delays, and no notification to the user about failed login attempts.
- **Exploitation Risk:** MEDIUM. Accounts are susceptible to brute-force attacks.
- **Fix Recommendation (P2):**
  - Implement account lockout after N failed attempts (e.g., 5).
  - Add progressive delays (exponential backoff) on failed attempts.
  - Consider CAPTCHA after repeated failures.

### SEC-12: Legacy Plaintext Fallback in Encryption

- **File:** `lib/security/user-settings-crypto.ts:48-54`
- **OWASP:** A02:2021 - Cryptographic Failures
- **Description:** The `decryptUserSettingValue` function falls back to returning the raw value as plaintext if it doesn't start with the `enc:v1:` prefix: `return { value, isLegacyPlaintext: true }`. This means any previously stored unencrypted values (gateway tokens, API keys) are returned as-is, and there's no forced re-encryption. There is no logging or alerting when plaintext values are encountered.
- **Exploitation Risk:** LOW-MEDIUM. If the database is compromised, unencrypted legacy values are immediately usable.
- **Fix Recommendation (P2):**
  - Add a migration to encrypt all existing plaintext values.
  - Log a warning when plaintext values are encountered.
  - Consider removing the plaintext fallback after migration.

---

## Low Findings

### SEC-13: dangerouslySetInnerHTML Usage

- **File:** `app/layout.tsx:77-80`
- **OWASP:** A03:2021 - Injection
- **Description:** The root layout uses `dangerouslySetInnerHTML` to inject a theme color script. The content is a static string constant (`THEME_COLOR_SCRIPT`) defined in the same file with no user input. This is safe as implemented.
- **Exploitation Risk:** NONE (current implementation is safe). Flagged as informational -- any future changes that introduce dynamic content into this script would create an XSS vulnerability.
- **Fix Recommendation (P3):** No action required. Keep the biome-ignore comment and avoid introducing dynamic content.

### SEC-14: Timing-Safe Comparison for Authentication

- **File:** `app/(auth)/auth.ts:46-48`
- **OWASP:** A07:2021 - Identification and Authentication Failures
- **Description:** When a user is not found, the code calls `await compare(password, DUMMY_PASSWORD)` to prevent timing attacks. This is a good practice (constant-time comparison for non-existent users). However, the `DUMMY_PASSWORD` is generated at module initialization (`lib/constants.ts:11`) and could theoretically vary between serverless cold starts.
- **Exploitation Risk:** VERY LOW. The current implementation is actually a security best practice. Flagged as informational.
- **Fix Recommendation (P3):** No action required. This is correctly implemented.

### SEC-15: Cookie Settings Rely on Framework Defaults

- **File:** `app/(auth)/auth.config.ts`, `app/(chat)/actions.ts:13-15`
- **OWASP:** A05:2021 - Security Misconfiguration
- **Description:** Cookie settings for session management are handled entirely by NextAuth defaults. The application also sets a `chat-model` cookie via `cookieStore.set("chat-model", model)` without explicit `Secure`, `HttpOnly`, or `SameSite` attributes. While NextAuth typically sets secure defaults for its session cookie, the chat-model cookie may lack security attributes.
- **Exploitation Risk:** LOW. The `chat-model` cookie contains non-sensitive data (model name).
- **Fix Recommendation (P3):**
  - Explicitly set `Secure`, `HttpOnly`, and `SameSite=Lax` on all cookies.

### SEC-16: Open Redirect Protection is Client-Side Only

- **File:** `app/(auth)/login/page.tsx:13-43`, `app/(auth)/register/page.tsx:12-42`
- **OWASP:** A01:2021 - Broken Access Control
- **Description:** The `getSafeRedirectPath` function validates redirect URLs to prevent open redirects. It checks for relative paths and same-origin URLs, which is correct. However, this validation runs only on the client side (`"use client"` component). A sophisticated attacker could bypass the client-side check by directly modifying the browser behavior.
- **Exploitation Risk:** LOW. The redirect is done via `router.replace()` (client-side navigation) rather than a server-side redirect, limiting the attack surface. Also, there is no server-side redirect that accepts user-controlled URLs.
- **Fix Recommendation (P3):** No immediate action required. The current implementation is reasonable for client-side routing.

---

## Positive Security Observations

The following security practices were found to be correctly implemented:

1. **Parameterized Queries:** All database queries use Drizzle ORM with parameterized queries (`eq()`, `gt()`, `lt()`, etc.) -- no raw SQL string concatenation. No SQL injection risk.
2. **Authentication on All API Routes:** Every API route checks `await auth()` and returns appropriate error responses for unauthenticated requests.
3. **Authorization Checks:** Chat and document routes verify ownership (`chat.userId !== session.user.id`) before allowing access.
4. **Password Hashing:** bcrypt with cost factor 10 is used for password hashing (`lib/db/utils.ts:5`).
5. **Encryption at Rest:** User-stored secrets (gateway tokens, API keys) are encrypted using AES-256-GCM with proper IV and auth tag handling (`lib/security/user-settings-crypto.ts`).
6. **Input Validation on Chat Route:** The main chat API uses Zod schemas for request validation (`app/(chat)/api/chat/schema.ts`).
7. **No Hardcoded Secrets:** No API keys, tokens, or passwords were found hardcoded in source files.
8. **`.env` Files Not Tracked:** `.env` and `.env.*` files are properly gitignored and not tracked in version control.
9. **Timing-Attack Mitigation:** The login flow uses a dummy password comparison for non-existent users to prevent user enumeration via timing.
10. **File Upload Validation:** File uploads are validated for type (JPEG/PNG only) and size (5MB max).
11. **Server-Only Imports:** Sensitive modules use `import "server-only"` to prevent accidental client-side bundling.

---

## Dependency Vulnerability Summary (pnpm audit)

| Package | Severity | CVE/Advisory | Status |
|---------|----------|-------------|--------|
| next@16.0.10 | HIGH | GHSA-h25m-26qc-wcjf | Patch available (>=16.0.11) |
| next-auth@5.0.0-beta.25 | MODERATE | GHSA-5jpx-9hw9-2fx4 | Patch available (>=5.0.0-beta.30) |
| esbuild@0.18.20/0.19.12 | MODERATE | GHSA-67mh-4wv8-2f99 | Patch available (>=0.25.0) |
| prismjs@1.27.0 | MODERATE | GHSA-x7hr-w5r2-h6wg | Patch available (>=1.30.0) |
| undici | MODERATE | - | Patch available (>=6.23.0) |

---

## Recommended Priority Actions

1. **P0 (Immediate):** Fix SSRF via gateway URL (SEC-01) -- add private IP range blocking.
2. **P0 (Immediate):** Upgrade `next` to >=16.0.11 (SEC-02).
3. **P1 (This sprint):** Add rate limiting to API endpoints (SEC-03).
4. **P1 (This sprint):** Stop exposing raw error messages in API responses (SEC-04).
5. **P1 (This sprint):** Sanitize upload filenames (SEC-05).
6. **P1 (This sprint):** Add CORS middleware (SEC-06).
7. **P2 (Next sprint):** Add Zod validation to all OpenClaw API routes (SEC-08).
8. **P2 (Next sprint):** Strengthen password policy (SEC-07).
9. **P2 (Next sprint):** Implement account lockout (SEC-11).
10. **P2 (Next sprint):** Migrate legacy plaintext encrypted values (SEC-12).
