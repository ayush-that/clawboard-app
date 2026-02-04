# UX Audit: Auth Pages (Login & Register)

## Summary

The login and register pages share a clean, minimal design via the reusable `AuthForm` component. Core form mechanics are solid (server actions, `useActionState`, proper loading states, accessible screen-reader announcements). However, the pages have significant gaps in validation feedback, password UX, error message specificity, and dark-mode toast styling that collectively degrade the experience for new and returning users.

## Issues Found

### Critical (blocks usability)

- **Toast is invisible in dark mode** -- `components/toast.tsx:48` -- The toast background is hardcoded to `bg-zinc-100` and text to `text-zinc-950` with no dark-mode variants. In dark mode the toast blends into or clashes with the dark background, making error messages nearly invisible. Since all auth error feedback is delivered exclusively through toasts (no inline errors), this effectively hides all validation and login-failure messages from dark-mode users.

- **No password requirements communicated on register** -- `components/auth-form.tsx:48-54` -- The password field has no `minLength` attribute, no hint text, and no visible requirements. The Zod schema in `app/(auth)/actions.ts:11` enforces `min(6)`, but users only discover this after submission via a vague "Failed validating your submission!" toast. Users must guess the requirements, leading to repeated failed attempts.

### Major (significant UX friction)

- **Generic, unhelpful error messages** -- `app/(auth)/login/page.tsx:33-34` -- Login failure shows "Invalid credentials!" which is acceptable, but validation failure at line 37-38 shows "Failed validating your submission!" -- a developer-facing message that tells the user nothing actionable (which field failed? what's wrong?). Same issue on the register page at `app/(auth)/register/page.tsx:34-36`. Users cannot correct their input without knowing what was invalid.

- **No password confirmation field on register** -- `components/auth-form.tsx` -- The same `AuthForm` is used for both login and register. The register page has no confirm-password field, so a typo in the password during registration locks the user out of their new account with no recourse (no password reset flow exists either).

- **No password reset / forgot password flow** -- `app/(auth)/login/page.tsx` -- There is no "Forgot password?" link or flow anywhere. A user who forgets their password has no self-service recovery option, which is a significant friction point for returning users.

- **`useEffect` triggers toast on every re-render with same status** -- `app/(auth)/login/page.tsx:29-45` and `app/(auth)/register/page.tsx:28-45` -- The `useEffect` depends on `state.status` as a string. If the component re-renders and the status hasn't changed (e.g., two consecutive "failed" submissions), the effect won't re-fire because the dependency value is identical. This means if a user submits invalid credentials twice in a row, they see the error toast only on the first attempt -- the second failed attempt produces no visible feedback. This is a subtle but real usability gap.

- **No `autoComplete` attribute on password field** -- `components/auth-form.tsx:48-54` -- The email input correctly has `autoComplete="email"`, but the password input has no `autoComplete` attribute. It should use `autoComplete="current-password"` for login and `autoComplete="new-password"` for register. This degrades password manager integration, especially on mobile where autofill is critical.

### Minor (polish/improvement)

- **`autoFocus` on email input may hurt mobile UX** -- `components/auth-form.tsx:29` -- The email input has `autoFocus` which forces the keyboard open immediately on mobile devices. This can be jarring, especially on smaller screens where the keyboard covers the UI before the user has oriented themselves. Consider removing `autoFocus` on mobile or deferring focus.

- **Heading level skip (`<h3>` with no `<h1>` or `<h2>`)** -- `app/(auth)/login/page.tsx:56` and `app/(auth)/register/page.tsx:56` -- Both pages use `<h3>` as the primary visible heading. Since there is no `<h1>` or `<h2>` ancestor on the page, this is a heading-level skip that screen readers may flag. Should be `<h1>` styled to look like the current `<h3>`.

- **No `aria-required` on form inputs** -- `components/auth-form.tsx:27-37, 48-54` -- Both inputs have the `required` HTML attribute, which provides native browser validation. However, adding `aria-required="true"` would improve screen reader announcements. This is a minor enhancement since `required` already implies `aria-required`.

- **Guest auth endpoint has no loading/error UX** -- `app/(auth)/api/auth/guest/route.ts` -- The guest login is a GET endpoint that creates a user and redirects. If the database call at line 21 fails or is slow, the user sees a blank white page or a browser error with no friendly feedback. There's no loading spinner or error page for this flow.

- **No rate limiting on auth endpoints** -- `app/(auth)/actions.ts:18-42, 54-84` -- Neither the login nor register server actions implement any rate limiting. While this is partially a security concern, from a UX perspective it means an attacker could cause account lockouts or performance degradation that affects legitimate users. This is mitigated somewhat by the server action mechanism but worth noting.

- **Successful login has no visual confirmation** -- `app/(auth)/login/page.tsx:40-44` -- On successful login, the page calls `router.refresh()` but shows no success toast (unlike register which shows "Account created successfully!" at `register/page.tsx:39`). The user sees only the loading spinner until the redirect completes, which may feel unresponsive on slow connections.

- **Form does not preserve password on validation error** -- `app/(auth)/login/page.tsx:47-50` -- The `handleSubmit` saves the email to state so it persists after a failed submission (via `defaultEmail`), but the password field is always cleared. While this is standard security practice for login, on the register page it forces users to re-type their password after every validation error, which is frustrating when combined with the lack of visible validation rules.

## Recommendations

1. **[Critical] Add dark-mode styling to toast** -- Add `dark:bg-zinc-800 dark:text-zinc-50` (or similar) to the toast container in `components/toast.tsx:48` so error/success messages are visible in dark mode.

2. **[Critical] Add visible password requirements on register** -- Add hint text below the password field (e.g., "Must be at least 6 characters") and add `minLength={6}` to the password `<Input>` so the browser provides native validation before round-tripping to the server.

3. **[Major] Improve error messages** -- Replace "Failed validating your submission!" with specific messages. For email: "Please enter a valid email address." For password: "Password must be at least 6 characters." This requires passing Zod field errors back through the action state rather than collapsing all validation into a single "invalid_data" status.

4. **[Major] Add `autoComplete` to password input** -- Pass `autoComplete` as a prop to `AuthForm` and set it to `"current-password"` on login and `"new-password"` on register.

5. **[Major] Add password confirmation on register** -- Either add a confirm-password field to the register form, or implement a password reveal toggle so users can verify what they typed.

6. **[Major] Fix duplicate-status toast suppression** -- Change the `useEffect` dependency to include a counter or timestamp (e.g., from the action state) so that repeated identical statuses still trigger the toast.

7. **[Minor] Fix heading levels** -- Change `<h3>` to `<h1>` on both auth pages and apply the same visual styling.

8. **[Minor] Add a success toast or message on login** -- Show brief feedback like "Signing in..." before the redirect occurs.

9. **[Minor] Consider a "Forgot password?" link** -- Even if the flow isn't implemented yet, a disabled link or placeholder signals to users that recovery will be available.
