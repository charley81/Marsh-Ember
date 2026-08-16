# Marsh & Ember — Design Handoff

## Canonical Figma file

https://www.figma.com/design/E0KH28qaBcyo8Y9d51bQup/Marsh---Ember

Figma file key: `E0KH28qaBcyo8Y9d51bQup`

The approved high-fidelity designs and production states are the implementation source of truth.

## Approved high-fidelity frames

| View | Desktop | Mobile |
|---|---|---|
| Home | `254:3955` — 1440×5618 | `254:4191` — 390×5320 |
| Menus landing | `265:4144` — 1440×5978 | `265:4482` — 390×6408 |
| Dinner menu detail | `265:4704` — 1440×5741 | `265:5092` — 390×5677 |
| Visit | `277:4828` — 1440×5846 | `277:4903` — 390×6277 |
| Our Story | `283:4798` — 1440×6638 | `283:4873` — 390×6722 |
| Private Dining | `295:4750` — 1440×7832 | `295:5065` — 390×8795 |
| Events landing | `302:5073` — 1440×6404 | `302:5327` — 390×5904 |
| Event detail template | `306:5232` — 1440×6151 | `307:4285` — 390×6932 |

## Approved production-state frames

| State | Node | Dimensions |
|---|---:|---:|
| Reservation loading | `314:5511` | 1440×900 |
| Reservation error | `314:5552` | 1440×900 |
| Reservation confirmed | `314:5574` | 1440×900 |
| Private Dining form states | `314:5658` | 1440×4213 |
| Event RSVP form states | `314:5874` | 1440×4333 |
| Events empty — desktop | `314:6086` | 1440×1783 |
| Events empty — mobile | `314:6210` | 390×2335 |
| Event availability states | `314:6367` | 1440×3003 |

## Approved Figma components

| Component | Node |
|---|---:|
| Button/Action | `181:2224` |
| FormField | `199:2486` |
| Status/Message | `209:2593` |
| Announcement/Global | `225:2646` |
| Header/Desktop | `229:3212` |
| Header/Mobile | `233:4025` |
| Footer/Global | `238:2469` |
| IconButton | `246:2870` |

Map these concepts to reusable code components. Figma component instances communicate hierarchy and state; they do not require a one-to-one reproduction of Figma layer structure.

## Responsive implementation

- Desktop reference width: 1440px.
- Mobile reference width: 390px.
- Support intermediate widths fluidly; do not switch directly between two fixed canvases.
- Use content-driven breakpoints based on where navigation, grids, actions, or editorial compositions stop fitting.
- Maintain consistent mobile page gutters.
- Stack actions when button labels become cramped.
- Preserve intentional full-bleed sections and editorial image crops.
- Desktop asymmetry may simplify into a clear single-column reading order on mobile.
- No page-level horizontal overflow is permitted.

## Global behavior

### Announcement

- CMS-controlled message and enabled state.
- Dismissal should persist for an appropriate period in local storage.
- Do not cause cumulative layout shift after hydration.

### Header and navigation

- Use semantic navigation landmarks.
- Current-page treatment must be available to assistive technology.
- Mobile menu must manage focus, close with Escape, and restore focus to its trigger.
- Reservation actions invoke the same reservation experience throughout the site.

### Footer

- Contact details, address, hours, and navigation should come from shared site settings where appropriate.
- Telephone and email values should use actionable links.

## Reservation experience

- Desktop: accessible modal/dialog over dimmed page content.
- Mobile may use a full-screen route or full-screen dialog if that produces more reliable embedded booking behavior.
- Embed Cal.com only after the visitor opens the reservation experience when feasible.
- Trap focus inside the dialog, support Escape, prevent background scrolling, and return focus to the triggering control.
- Provide loading, delayed-loading, provider-error, and confirmed states matching `314:5511`, `314:5552`, and `314:5574`.
- The error fallback may open the secure booking page in a new tab or provide direct restaurant contact actions.
- Never imply that a reservation exists after a provider error.

## Forms

### Private Dining

The production form should include the fields represented in Figma:

- First name
- Last name
- Email address
- Phone number
- Event type
- Preferred date
- Preferred time
- Estimated guest count
- Space preference
- Estimated food and beverage budget
- Additional information
- Required acknowledgment

The submission endpoint must validate data server-side, protect against spam and abuse, and issue a non-sensitive inquiry reference after successful persistence or delivery.

### Event RSVP

The production form contains six primary fields:

- First name
- Last name
- Email address
- Phone number
- Number of guests
- Dietary or accessibility information

It also includes the required acknowledgment shown in Figma.

The server must verify that the event is accepting requests at submission time. A successful request-received response is not confirmed attendance.

### Shared form behavior

- Use visible labels; placeholders are supplemental only.
- Associate descriptions and errors with their fields.
- Provide an error summary that links or moves focus to invalid fields.
- Preserve entered values after validation and server errors.
- Disable duplicate submission while a request is pending.
- Announce pending, error, and success results accessibly.
- Do not expose internal exception text.

## Events

- Events landing is driven by CMS event records.
- Provide the designed no-upcoming-events state.
- Event detail is a reusable CMS template.
- The approved example contains seven event facts, five menu courses, and six RSVP fields.
- The displayed event time is `6:30 PM – Approximately 9 PM` on both desktop and mobile.
- Event status controls whether the active RSVP form or a replacement panel is shown.

Supported presentation states:

- Accepting RSVP requests
- RSVP closed
- Sold out
- Cancelled
- Past event

Do not show an active RSVP form when the event status makes submission unavailable.

## Content and data constraints

- Preserve approved page copy unless correcting a clear implementation typo.
- All event and customer examples are fictional.
- Do not invent prices, capacities, guarantees, response times, payment requirements, or operational policies.
- Standard reservation language may mention Cal.com or a neutral secure booking page.
- No Resy or OpenTable references.

## Accessibility checklist

- Semantic heading order and landmarks.
- Keyboard-operable menus, modal, forms, buttons, links, and accordions.
- Visible focus styles.
- Dialog labeling and focus management.
- Form labels, instructions, required indicators, and programmatic errors.
- Status updates exposed through appropriate live regions.
- Error and success states do not rely on color alone.
- Meaningful alternative text for content images; empty alternative text for decorative images.
- Touch targets of approximately 44×44px where possible.
- Sufficient text and control contrast.
- Reduced-motion behavior for nonessential animation.

## Motion guidance

- Keep motion restrained and hospitality-focused.
- Favor subtle reveals, image movement, menu transitions, and micro-interactions.
- Avoid delaying access to content.
- Respect `prefers-reduced-motion` and provide a complete experience with motion disabled.

## Final design QA status

- All 16 approved high-fidelity page frames were reviewed.
- All eight essential state boards were reviewed.
- Desktop full-page designs remain 1440px wide.
- Mobile full-page designs remain 390px wide.
- No forbidden Resy or OpenTable references were found.
- No legacy low-fidelity component instances were found in the audited frames.
- S01–S03 close controls are attached 44×44 IconButton instances positioned in their modal header rows.
- S02 uses an attached Error Status/Message instance.
- The final corrected S01–S03 frames have no visible clipping or overflow.

