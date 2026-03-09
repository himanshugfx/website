# Code Review Rules

These rules apply whenever the agent reviews, audits, or evaluates code — across both the web and Android targets.

---

## General Principles

- Prioritize correctness first, then readability, then performance.
- Flag issues by severity: `[CRITICAL]`, `[WARNING]`, `[SUGGESTION]`.
- Never silently skip a file — always acknowledge what was reviewed.
- When suggesting a fix, show the corrected code snippet alongside the reason.
- Do not rewrite working code unless there is a clear, justified benefit.

---

## Code Quality

- Flag any function longer than 60 lines — suggest breaking it into smaller, single-responsibility units.
- Reject deeply nested logic (more than 3 levels of indentation) — suggest early returns or extracted helpers.
- Disallow commented-out code blocks — remove them or convert to a proper TODO with an issue reference.
- Every public function, method, or exported module must have a doc comment explaining its purpose and parameters.
- No magic numbers or magic strings — require named constants with clear intent.

---

## Web (Frontend)

- All components must be functional with hooks — no class components.
- Props must be typed (TypeScript interfaces or PropTypes) — flag any `any` type usage.
- No inline styles — all styling must go through Tailwind utility classes or the project's CSS module system.
- Flag any `useEffect` without a dependency array, or with a dependency array that is clearly incomplete.
- Accessibility: every interactive element (`button`, `input`, `a`) must have an accessible label or `aria-*` attribute.
- No hardcoded URLs or environment-specific values — use environment variables.
- Images must have meaningful `alt` text — flag empty `alt=""` on non-decorative images.
- Flag any `console.log` or `debugger` statements left in production-bound code.

---

## Android

- All network calls must be made off the main thread — flag any IO on `Main` dispatcher.
- ViewModels must not hold references to `Context` or `Activity` — use `ApplicationContext` where needed.
- Require null safety: no use of `!!` (non-null assertion) without an explicit justification comment.
- All database queries must be wrapped in a `try/catch` — flag unhandled exceptions in Room DAOs.
- Flag any hardcoded strings in XML layouts or Kotlin files — all user-visible strings must be in `strings.xml`.
- No `Thread.sleep()` in production code — use coroutine delays with proper scope.
- Permissions must be requested at runtime where required — flag any permission assumed to be granted.

---

## Security

- Flag any API key, secret, token, or credential that appears in source code — these must go in environment variables or a secrets manager.
- Reject any use of `MD5` or `SHA-1` for cryptographic purposes — require `SHA-256` or stronger.
- Flag SQL queries built via string concatenation — require parameterized queries.
- For Android: flag use of `allowBackup=true` in `AndroidManifest.xml` for apps handling sensitive data.
- For Web: flag any use of `dangerouslySetInnerHTML` without explicit sanitization.

---

## Testing

- Every new function or component must have at least one corresponding test.
- Flag any test that uses `sleep` or arbitrary timeouts to pass — require proper async handling.
- No skipped tests (`it.skip`, `@Ignore`) without a linked issue explaining why.
- Mock external dependencies — flag tests that make real network calls.

---

## Git & PR Hygiene

- Commits must follow Conventional Commits format: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.
- Flag PRs with more than 400 lines changed — suggest splitting into smaller, reviewable units.
- Every PR must have a description explaining what changed and why.
- Link PRs to a relevant issue or task where applicable.

---

## Review Sign-off Checklist

Before marking a review complete, confirm:

- [ ] No `[CRITICAL]` issues remain unresolved
- [ ] All suggested fixes have been acknowledged by the author
- [ ] Tests pass and coverage has not decreased
- [ ] No secrets or credentials are present in the diff
- [ ] Accessibility and platform-specific rules have been verified
