# Marsh & Ember — Project Context

## Project purpose

Marsh & Ember is a fictional, portfolio-quality restaurant website designed to demonstrate the level of strategy, UX, visual design, CMS architecture, integration work, and frontend execution expected from a modern web studio.

The implementation should feel credible as a real client project while remaining honest about fictional event and customer data.

## Product goals

- Present Marsh & Ember as a refined Charleston restaurant centered on wood-fired cooking, seasonal ingredients, and Southern hospitality.
- Make menus, hours, location, accessibility details, events, and reservation actions easy to find.
- Convert visitors into standard dining reservations, Private Dining inquiries, and special-event RSVP requests.
- Provide editors with a maintainable CMS workflow for menus, events, and reusable business content.
- Deliver an agency-grade portfolio project with excellent responsive behavior, accessibility, performance, and UX states.

## Approved visual direction

Use the completed Figma Direction C designs as the source of truth.

- Editorial, warm, refined, and contemporary.
- Strong food and hospitality photography.
- Restrained use of warm neutrals, ember accents, and deep navy.
- Spacious layouts with intentional asymmetry on desktop.
- Clear, linear stacking on mobile without losing content.
- Avoid generic SaaS patterns, excessive cards, unnecessary decoration, or redesigning approved compositions during development.

## Site scope

### Public pages

- Home
- Menus landing
- Dinner menu detail
- Visit
- Our Story
- Private Dining
- Events landing
- Event detail CMS template

### Functional experiences

- Standard reservations through an embedded Cal.com experience or secure Cal.com booking route.
- Private Dining inquiry submitted through the website backend.
- Special-event RSVP request submitted through the website backend.
- Loading, validation, submitting, error, success, empty, closed, sold-out, cancelled, and past-event states.

## Important integration boundaries

- Do not use Resy or OpenTable.
- Cal.com is only for standard restaurant reservations.
- Private Dining inquiries must not route to Cal.com.
- Event RSVP requests must not route to Cal.com.
- A submitted Private Dining inquiry does not reserve a date or confirm an event.
- A received RSVP request does not confirm attendance.
- Confirmation language must only appear after the appropriate confirmed outcome.

## CMS direction

Use Sanity as the headless CMS unless the repository setup explicitly documents a later approved change.

CMS-driven content should include:

- Site settings and restaurant contact information
- Operating hours
- Announcement content and enabled state
- Menus and menu sections
- Menu items, descriptions, prices, and dietary markers
- Events and event status
- Event detail content
- Event facts and menu courses
- Reusable editorial images and alt text

The event detail design is one reusable template populated by CMS data. Do not create a separate coded page implementation for every event.

## Development principles

- Designs are complete; development should implement them rather than reopen the design phase.
- Build reusable components when repetition is proven by the designs.
- Preserve semantic HTML and progressive enhancement.
- Prefer server rendering and minimal client JavaScript.
- Treat mobile and desktop designs as two responsive expressions of the same content—not independent sites.
- Deploy a working preview as early as practical after project initialization.
- Never include real customer information in fixtures, screenshots, seed data, or tests.

## Quality targets

- Responsive from 320px through large desktop widths.
- WCAG 2.2 AA-oriented implementation.
- Keyboard-operable navigation, dialogs, forms, and accordions.
- Visible focus states and useful form errors.
- Reduced-motion support.
- Optimized responsive images and fonts.
- Strong Core Web Vitals and a Lighthouse target of 95+ where realistic for production-like pages.
- No horizontal page overflow, clipped text, or layout shifts caused by missing media dimensions.

