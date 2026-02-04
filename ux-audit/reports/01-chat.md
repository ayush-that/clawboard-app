# UX Audit: Chat Pages

## Summary

The chat pages provide a solid conversational UI with good streaming support, auto-scroll behavior, and message editing. However, there are several UX issues ranging from empty loading states that give no visual feedback, accessibility gaps in interactive elements, hardcoded color values that break theming, and mobile-specific friction points around the input area and header layout.

## Issues Found

### Critical (blocks usability)

- **Empty Suspense fallback provides no loading indication** -- `app/(chat)/page.tsx:10` and `app/(chat)/chat/[id]/page.tsx:13` -- Both pages use `<div className="flex h-dvh" />` as the Suspense fallback. This renders a completely blank screen while the async server component resolves (which includes a DB query on `/chat/[id]`). Users see a blank white page with no spinner, skeleton, or any indication the app is loading. This is especially problematic on slow connections or when the database is under load.

- **Textarea height is hardcoded to 44px and never auto-resizes** -- `components/multimodal-input.tsx:66-70` and `components/multimodal-input.tsx:89-93` -- Both `adjustHeight` and `resetHeight` set `textareaRef.current.style.height = "44px"` unconditionally. The `disableAutoResize={true}` prop is passed to `PromptInputTextarea` at line 346, which sets `field-sizing-fixed` (line 79-80 of `prompt-input.tsx`). Combined, the textarea never grows as the user types multi-line input. Users typing long messages cannot see their full input, which is a major usability blocker for any serious chat use.

- **Readonly chat shows empty input area container** -- `components/chat.tsx:178-195` -- When `isReadonly` is true, the `MultimodalInput` is hidden but its parent `<div className="sticky bottom-0 ...">` still renders with padding (`pb-3`/`pb-4`) and `border-t-0`. This creates a visible empty bar at the bottom of readonly chats, wasting vertical space and confusing users about whether they should be able to type.

### Major (significant UX friction)

- **Hardcoded user message background color breaks dark mode theming** -- `components/message.tsx:134-136` -- The user message bubble uses `style={{ backgroundColor: "#006cff" }}` as an inline style. This hardcoded blue ignores the theme system entirely. While it works visually in both modes by coincidence (blue on blue is fine), it means this color cannot be customized via CSS variables and will not adapt if the theme palette changes. The `text-white` class at line 128 also hardcodes text color rather than using theme tokens.

- **Visibility selector is completely hidden on mobile** -- `components/visibility-selector.tsx:72` -- The trigger button has `className="hidden h-8 md:flex"`, making the entire visibility selector invisible on screens below 768px. Mobile users have no way to change chat visibility (public/private), which is a significant feature gap. There is no alternative mobile UI for this control.

- **No error recovery UI when chat stream fails** -- `components/chat.tsx:122-129` -- The `onError` handler only shows a toast notification for `ChatSDKError` instances. Non-ChatSDKError errors are silently swallowed. After any error, the user is left in an ambiguous state with no retry button, no indication of what went wrong in the message list, and no way to resend. The `PromptInputSubmit` component at `prompt-input.tsx:172-173` does show an X icon for `status === "error"` but it is just visual -- there is no click handler to retry.

- **File input has no accept attribute -- any file type can be selected** -- `components/multimodal-input.tsx:286-293` -- The hidden file input allows all file types. If the backend only supports certain types (images, PDFs, etc.), users can select unsupported files, wait for upload, and only then get an error toast. There should be an `accept` attribute to filter the file picker upfront.

- **Attachment remove button is invisible on touch devices** -- `components/preview-attachment.tsx:48` -- The remove button uses `opacity-0 ... group-hover:opacity-100`, which requires hover. On touch/mobile devices, there is no hover state, so users cannot remove attachments once added. The button never becomes visible without a mouse.

- **Message edit mode has layout shift due to phantom spacer** -- `components/message.tsx:158` -- When a user message enters edit mode, a `<div className="size-8" />` spacer is rendered at line 158. This is presumably to align with the assistant avatar, but user messages are right-aligned and don't have an avatar. The spacer causes the edit textarea to be offset from the original message position, creating a jarring layout shift.

### Minor (polish/improvement)

- **Suggested actions disappear permanently after any attachment is added** -- `components/multimodal-input.tsx:276-284` -- The condition `attachments.length === 0 && uploadQueue.length === 0` means adding then removing an attachment will still hide suggestions if messages were sent meanwhile. More importantly, if a user attaches a file but then removes it before sending, the suggestions reappear -- but this conditional coupling between unrelated features (attachments vs. suggestions) is confusing.

- **"New Chat" button label is hidden on desktop when sidebar is open** -- `components/chat-header.tsx:30-42` -- The button is only rendered when `!open || windowWidth < 768`. When the sidebar is open on desktop, there is no "New Chat" button in the header at all. Users must use the sidebar to create a new chat. This is fine but may not be obvious.

- **`useWindowSize` causes unnecessary re-renders** -- `components/chat-header.tsx:24` and `components/multimodal-input.tsx:64` -- Both components use `useWindowSize()` from usehooks-ts, which triggers re-renders on every resize event. In `ChatHeader`, it is used only to check `windowWidth < 768`, and in `MultimodalInput`, it is used only to decide whether to refocus after submit. A media query or matchMedia listener would be more efficient.

- **Stop button only shows during "submitted" status, not during "streaming"** -- `components/multimodal-input.tsx:365-376` -- The stop button is only rendered when `status === "submitted"`. During `status === "streaming"` (when tokens are actively arriving), the submit button is shown instead. Users cannot stop a stream that has already started producing output -- they can only stop during the initial request phase.

- **Greeting component uses hardcoded `text-zinc-500` instead of theme token** -- `components/greeting.tsx:20` -- The subtitle "How can I help you today?" uses `text-zinc-500` which is a fixed Tailwind color, not a theme-aware token like `text-muted-foreground`. In dark mode, zinc-500 may have insufficient contrast against the background.

- **Chat page silently redirects to `/` when chat is not found instead of showing a 404** -- `app/(chat)/chat/[id]/page.tsx:23-25` -- When `getChatById` returns null, the user is redirected to the homepage with no explanation. They have no way to know the chat was deleted or never existed. A proper 404 page or toast message would be more informative.

- **Toast import inconsistency** -- `components/multimodal-input.tsx:16` imports `toast` from `"sonner"` while `components/chat.tsx:21` imports from `"./toast"` (a wrapper). This could lead to inconsistent toast styling or behavior if the wrapper adds custom defaults.

- **Scroll-to-bottom button overlaps with last message content** -- `components/messages.tsx:84-95` -- The scroll-to-bottom button is positioned `absolute bottom-4` inside the relative messages container. When the user scrolls up, this button can visually overlap with the last visible message. There is no padding or margin compensation for this overlay.

- **No keyboard shortcut to focus the input** -- The chat input auto-focuses on load (`multimodal-input.tsx:79-87`) but after clicking elsewhere (e.g., reading a message, clicking an artifact), there is no keyboard shortcut (like `/` or `Ctrl+K`) to return focus to the input field.

## Recommendations

1. **Add meaningful Suspense fallbacks** -- Replace the empty `<div className="flex h-dvh" />` with a skeleton UI showing a header bar, message area placeholder, and input box outline. This is the highest-impact, lowest-effort fix.

2. **Fix textarea auto-resize** -- Either remove `disableAutoResize={true}` from the `PromptInputTextarea` usage, or fix `adjustHeight` to read `scrollHeight` and set height dynamically (capped at `maxHeight={200}`). The current implementation sets height to 44px regardless of content.

3. **Hide the input container for readonly chats** -- Wrap the entire sticky bottom div with the `!isReadonly` conditional, not just the `MultimodalInput` component inside it.

4. **Use theme tokens for user message bubble** -- Replace `style={{ backgroundColor: "#006cff" }}` with a CSS variable-backed class like `bg-primary` or a custom theme token. Replace `text-white` with `text-primary-foreground`.

5. **Add mobile visibility selector** -- Either remove the `hidden` class and make it responsive, or add an alternative control (e.g., in a bottom sheet or the chat header dropdown on mobile).

6. **Add error recovery to the message stream** -- Show an inline error message in the chat when streaming fails, with a "Retry" button that calls `regenerate()`. Do not rely solely on toast notifications.

7. **Add `accept` attribute to file input** -- Specify allowed MIME types to filter the file picker before upload.

8. **Make attachment remove button touch-friendly** -- Always show the remove button (or show it on tap/long-press), rather than relying on hover-only visibility.

9. **Show stop button during streaming status** -- Change the condition at `multimodal-input.tsx:365` from `status === "submitted"` to `status === "submitted" || status === "streaming"` so users can stop active streams.

10. **Add a keyboard shortcut to focus input** -- Implement a global keydown listener for a shortcut like `/` (when not in an input) to focus the chat textarea.
