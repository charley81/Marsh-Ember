<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Marsh & Ember — Agent Instructions

## Source of truth

Before implementing or changing this project, read:

1. `context/project-context.md`
2. `context/design-handoff.md`
3. The relevant approved Figma frame through Figma MCP

Do not infer a page solely from screenshots when structured Figma data is available.

## Scope and workflow

- The design phase is complete. Implement the approved designs; do not initiate a redesign.
- The user will initialize the project and choose the initial package setup.
- Use current stable package versions at initialization time.
- Work page-first and componentize patterns that are proven to repeat.
- Keep changes small enough to verify safely.
- Deploy a preview as early as practical after the application can render a meaningful route.
- Do not commit, push, create external resources, or deploy unless the user requests that action.

## Suggested implementation architecture

Unless the initialized repository states otherwise:

- Next.js with TypeScript
- App Router
- Sanity CMS
- Cal.com for standard dining reservations only
- Server-side handlers for Private Dining and Event RSVP submissions
- A production-appropriate email or persistence provider selected during implementation

Do not install packages before confirming that an existing dependency does not already solve the need.

## Figma implementation rules

- Use Figma node IDs documented in `context/design-handoff.md`.
- Inspect exact spacing, typography, colors, image crops, and responsive behavior through Figma MCP.
- Translate Figma components into maintainable code components.
- Do not reproduce unnecessary wrapper layers from Figma.
- Preserve approved visual hierarchy and content.
- Avoid hardcoded one-off values when a shared design token is appropriate.
- Never use Figma-generated images or examples containing real personal information.

## Integration rules

- Never add Resy or OpenTable.
- Cal.com is only for standard restaurant reservations.
- Private Dining and Event RSVP use the website backend.
- Never treat a Private Dining inquiry as a confirmed booking.
- Never treat an RSVP request as confirmed attendance.
- Recheck event availability on the server at submission time.
- Validate all externally supplied data on the server.
- Add spam protection, rate limiting, and safe error responses before production launch.

## CMS rules

- Event detail is a reusable CMS template, not one coded route per event.
- Model menus, menu sections, menu items, dietary markers, events, event status, event facts, courses, shared restaurant details, and announcement content.
- Use stable slugs and preview-friendly queries.
- Do not bake mutable restaurant information into many components.
- Provide sensible fallbacks when optional CMS media or copy is absent.

## Accessibility requirements

- Use semantic HTML before adding ARIA.
- Maintain a logical heading hierarchy.
- Ensure all functionality works with a keyboard.
- Implement correct focus behavior for mobile navigation and the reservation dialog.
- Keep visible labels for form controls.
- Associate errors and help text programmatically.
- Use live regions carefully for submission and reservation status.
- Respect reduced-motion preferences.
- Test at 200% zoom and narrow widths.

## Performance requirements

- Prefer server components where interaction is not required.
- Minimize client-side JavaScript.
- Provide image dimensions and responsive image sizes.
- Optimize fonts and avoid unnecessary font weights.
- Lazy-load below-the-fold media and the Cal.com embed where appropriate.
- Avoid hydration-driven layout shifts.
- Measure before adding complex animation libraries.

## Testing requirements

Use the existing project test conventions. Read an existing test before adding another.

For meaningful behavior changes, cover the smallest useful layer:

- Unit tests for data mapping, validation, and status-selection logic.
- Integration tests for CMS query mapping and server submission handlers.
- Focused end-to-end tests for critical visitor journeys.

Critical end-to-end journeys:

- Navigate to menus and view the dinner menu.
- Open and close the reservation experience with keyboard focus restored.
- Exercise the reservation provider-error fallback.
- Submit a valid Private Dining inquiry and verify receipt messaging.
- Verify Private Dining validation and server-error value preservation.
- Submit a valid event RSVP request and verify that receipt does not claim confirmed attendance.
- Verify RSVP validation and unavailable event statuses.
- Verify the no-upcoming-events presentation.
- Exercise mobile navigation.

Do not create exhaustive visual regression infrastructure unless the user approves it. Styling-only adjustments do not require new behavioral tests, but should receive responsive and accessibility checks.

Never claim a test, build, lint, audit, or deployment succeeded unless it was actually run.

## Verification before handing off a change

Run the relevant available checks, typically:

- Formatting
- Lint
- Type checking
- Focused tests
- Production build for meaningful integration changes
- Responsive browser review at representative mobile, tablet, laptop, and desktop widths
- Keyboard and basic screen-reader-oriented review for changed interactions

Report:

- What changed
- Which routes or components were affected
- Checks actually run and their results
- Known limitations or follow-up work

