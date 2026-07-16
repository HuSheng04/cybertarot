# CyberTarot Visual Polish Implementation Plan

> **For agentic workers:** Execute this plan task by task. Before changing code, read `AGENTS.md`, `design-system/MASTER.md`, and the relevant file in `design-system/pages/`. Use the existing project branch/workspace unless the user explicitly asks for a worktree.

**Goal:** Evolve CyberTarot from a feature-complete cyberpunk interface into a focused “data-oracle ritual”, improving visual hierarchy, result-stage readability, card-library browsing, and mobile presentation without changing tarot, streaming, or API behavior.

**Architecture:** Keep the existing Next.js App Router, Tailwind v4, Motion, and R3F structure. The work is visual and interaction-focused: add a small set of reusable presentation primitives, reshape the home result overlay into a controlled bottom sheet, replace inline card expansion with an accessible modal, and simplify page-specific decorative language. Do not alter `TarotProvider`, draw logic, SSE protocol, DeepSeek requests, or card data.

**Tech stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Motion/Framer Motion, React Three Fiber, Jest, Playwright CLI.

---

## Product decisions locked by this plan

1. **Art direction:** “数据神谕仪式 (Data Oracle Ritual)”. Deep-space is the constant stage; cyan means system/data/action; purple means fate/mystery; green/red only communicate upright/reversed state. Do not add a new visual style or broad new color palette.
2. **Motion rule:** one primary motion event per moment. Decorative motion stays low opacity and never competes with text or card flips.
3. **Result-stage layout:** the 3D table remains the primary visual. The reading starts as a compact bottom sheet and can expand to a readable 75dvh panel. It must never be permanently open at its maximum height.
4. **Card details:** `/cards` uses one accessible modal, not an inline expanded grid item. The modal carries the large image and both meanings.
5. **Icons and language:** replace structural emoji with a small local SVG symbol set; use simplified Chinese consistently. Decorative `✦` is permitted only as non-semantic ornament, not as an icon or control label.
6. **Scope boundary:** no new LLM features, account features, deck mechanics, database work, audio, analytics, or generated image assets.

## Current evidence and problems to preserve in context

- The deployed `/?demo` flow reaches completed reading successfully. Existing card flip order and streaming/fallback behavior are working and must be preserved.
- `src/app/page.tsx` currently gives the reading overlay up to `75dvh` immediately, making it compete with the 3D result scene.
- `src/app/cards/page.tsx` uses six desktop columns at `xl` and expands meanings inside the grid. Both differ from `design-system/pages/cards.md` (five columns maximum and modal detail).
- The active Wands tab renders redundant text (`权杖(权杖)`).
- `src/app/about/AboutContent.tsx` uses a wide ASCII architecture block, which is usable only via horizontal scrolling on mobile; the page guide calls for a Mermaid-style architecture presentation.
- `Navbar`, reading labels, errors, and about-page labels contain structural emoji despite the design system prohibition.

## File map

| Path | Action | Responsibility |
|---|---|---|
| `src/components/icons/OracleGlyph.tsx` | Create | Local SVG glyphs for logo, system state, time positions, close/expand controls. |
| `src/components/ReadingSheet.tsx` | Create | Controlled compact/expanded bottom sheet around `ReadingStream`. |
| `src/components/CardDetailModal.tsx` | Create | Accessible card detail modal, focus handling, backdrop and close behavior. |
| `src/components/ArchitectureFlow.tsx` | Create | Responsive semantic architecture flow for the About page. |
| `src/components/Navbar.tsx` | Modify | Replace emoji logo with SVG glyph and preserve responsive navigation. |
| `src/components/ReadingStream.tsx` | Modify | Use semantic position labels/glyphs, remove emoji CTA, preserve streaming lifecycle. |
| `src/app/page.tsx` | Modify | Use `ReadingSheet`; preserve fullscreen R3F and all phase transitions. |
| `src/app/cards/page.tsx` | Modify | Use modal state, correct tab labels, conform grid to 2/3/4–5 column specification. |
| `src/app/about/AboutContent.tsx` | Modify | Use `ArchitectureFlow`, simplify Chinese copy, remove structural emoji. |
| `src/app/globals.css` | Modify | Add only shared sheet/modal/material utilities; tune global scanline intensity without breaking reduced-motion rules. |
| `__tests__/components/*.test.tsx` | Create/modify as appropriate | Component behavior tests for new visual interaction boundaries. |
| `e2e/visual-polish.spec.ts` | Create | Browser checks for core interactions and mobile layout. |

## Implementation order

### Task 1: Establish the visual contract and reusable SVG glyphs

**Files:**
- Create: `src/components/icons/OracleGlyph.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/app/globals.css`
- Test: `__tests__/components/Navbar.test.tsx`

- [ ] Record a short before-state screenshot set at 1440×900 and 375×812 for `/`, `/?demo`, `/cards`, and `/about`. Keep it outside the git worktree or in an ignored Playwright artifact directory.
- [ ] Write a failing Navbar test that asserts the brand link has an accessible label of `CyberTarot 2077` and does not expose the `🎴` emoji in its rendered text.
- [ ] Implement `OracleGlyph` as a typed local SVG component. It must support `brand`, `past`, `present`, `future`, `system-error`, `close`, `expand`, and `collapse` names; use `currentColor`, an explicit `aria-hidden` default, and no external icon dependency.
- [ ] Replace the Navbar emoji with the `brand` glyph. Keep the existing `CyberTarot` desktop label and `2077` mobile label behavior; make the link’s accessible name stable at all breakpoints.
- [ ] Add shared CSS utilities only for: low-opacity star/noise material, modal backdrop, and bottom-sheet edge/shadow. Do not add a second global scanline layer. Reduce the existing global scanline opacity on desktop enough that it is ambient rather than visually legible over body text.
- [ ] Verify `prefers-reduced-motion` still disables every continuous animation, including any new material animation.
- [ ] Run `pnpm test -- Navbar` and `pnpm lint`; expected result: both pass.
- [ ] Commit with message: `feat: establish oracle visual primitives`.

**Acceptance criteria:** The brand is recognizably cyber-tarot without emoji, desktop/mobile navigation stays unchanged functionally, and the only global ambience remains subtle.

### Task 2: Convert the reading result into a controllable bottom sheet

**Files:**
- Create: `src/components/ReadingSheet.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/ReadingStream.tsx`
- Test: `__tests__/components/ReadingSheet.test.tsx`

- [ ] Write failing tests for `ReadingSheet`: it renders compact by default; its expand control changes `aria-expanded` to `true`; collapse returns it to compact; it passes `onReset` and `onComplete` through unchanged.
- [ ] Implement `ReadingSheet` with two explicit states: `compact` and `expanded`. Compact state shows a drag-style visual handle, heading, a one-line state indicator, and the first completed paragraph only; expanded state exposes the complete `ReadingStream` in a scrollable panel. Use buttons, not drag-only controls, so the feature remains keyboard-accessible.
- [ ] Use Motion layout transitions with 250–300ms duration for the sheet. In reduced-motion mode the state must switch without travel animation.
- [ ] Replace the fixed reading overlay in `src/app/page.tsx` with `ReadingSheet`. Preserve `z-40`, the full-screen R3F canvas, and the ability to cancel during streaming. Compact sheet height must fit within 30dvh; expanded sheet maximum remains 75dvh.
- [ ] Update `ReadingStream` to accept an optional display mode or an optional `showHeader`/`showActions` configuration required by the sheet. Keep `startReading`, abort, retry, fallback, and `onComplete` semantics unchanged.
- [ ] Replace heading and reset-button emoji with `OracleGlyph` or text. Keep text labels as `过去的痕迹`, `现在的能量`, and `未来的可能`; use the glyph as decoration only, never as the sole meaning carrier.
- [ ] Verify no sheet layer blocks the Navbar or 3D canvas controls when compact. Verify scrolling is confined to the expanded sheet rather than the document body.
- [ ] Run targeted Jest tests, `pnpm lint`, and the existing test suite.
- [ ] Commit with message: `feat: focus the reading result stage`.

**Acceptance criteria:** At result completion the three cards remain visibly dominant; the reading can be expanded deliberately; Esc cancellation, retry, reset, streaming, fallback and demo mode continue to work.

### Task 3: Add result-stage card correspondence and motion restraint

**Files:**
- Modify: `src/components/ReadingStream.tsx`
- Modify: `src/components/CardMesh.tsx`
- Modify: `src/components/TarotTable3D.tsx`
- Modify: `src/lib/motionTokens.ts` only if an existing token cannot express the specified transition
- Test: `__tests__/components/ReadingStream.test.tsx`

- [ ] Write a failing test that checks a completed reading section renders a text position marker and its accessible card name, without relying on color alone.
- [ ] Introduce a single optional `activePosition` prop flowing from the reading area to `TarotTable3D`, then to `CardMesh`. `activePosition` may be `past`, `present`, `future`, or `null`.
- [ ] When the user expands a reading section or navigates to it within the sheet, set the matching active position. The selected card receives a restrained emissive/edge-light increase; non-selected cards remain visible and do not dim below readable recognition.
- [ ] Keep the existing flip timing authoritative: 0ms/500–600ms/1000–1200ms starts, ~800ms duration. Add at most one 150–250ms light sweep after each reveal; no camera shake and no auto-rotation.
- [ ] Ensure texture disposal, ErrorBoundary fallback, and low-performance Canvas configuration are untouched except for the minimal active-state prop plumbing.
- [ ] Test at desktop and 375px for no overlay clipping. Check reduced motion and WebGL fallback visually.
- [ ] Commit with message: `feat: connect reading sections to tarot table`.

**Acceptance criteria:** Reading and cards feel like one result, not two competing panels; the animation hierarchy is calmer than before and remains performance-safe.

### Task 4: Rebuild the card library detail experience around an accessible modal

**Files:**
- Create: `src/components/CardDetailModal.tsx`
- Modify: `src/app/cards/page.tsx`
- Test: `__tests__/components/CardDetailModal.test.tsx`
- Test: `__tests__/app/cards.test.tsx`

- [ ] Write failing tests that assert: clicking a card opens a dialog; the dialog has the card’s Chinese and English names; Escape closes it; backdrop click closes it; focus returns to the clicked card; changing filter closes the dialog.
- [ ] Implement `CardDetailModal` with `role="dialog"`, `aria-modal="true"`, an explicit labelled heading, a close button with an accessible label, backdrop click support, Escape support, and focus restoration. Use the existing `DrawnCard`/card data shape rather than duplicating card types.
- [ ] Lay out the dialog as: large optimized image; Chinese name, English name, suit and number; keyword chips; upright meaning with cyan label; reversed meaning with red label. Keep readable body text at `text-sm` or larger.
- [ ] Replace `expandedId` in `src/app/cards/page.tsx` with `selectedCard`. Remove in-grid meaning content and use the modal component.
- [ ] Correct the Wands selected tab label so it renders only `权杖`. Use the same data source for filters and visible counts.
- [ ] Align the grid with the page guide: `grid-cols-2`, `sm:grid-cols-3`, `md:grid-cols-4`, `lg:grid-cols-5`; remove the six-column `xl` layout. Keep image hover lift at -4px and cyan border glow.
- [ ] Make each card a semantic button or give its clickable container equivalent keyboard semantics. Enter and Space must open the dialog.
- [ ] Confirm next/image uses appropriate `sizes` for the revised grid and retains lazy loading.
- [ ] Run Jest tests, `pnpm lint`, and browser checks for all filters, a modal open/close sequence, and the 375px grid.
- [ ] Commit with message: `feat: polish tarot library detail modal`.

**Acceptance criteria:** Browsing 78 cards never causes grid reflow from details; modal behavior is keyboard accessible; desktop cards are visually collectible rather than cramped.

### Task 5: Turn the About architecture into a responsive product story

**Files:**
- Create: `src/components/ArchitectureFlow.tsx`
- Modify: `src/app/about/AboutContent.tsx`
- Test: `__tests__/components/ArchitectureFlow.test.tsx`

- [ ] Write a failing test asserting the architecture flow contains Client, Server, and DeepSeek nodes in source/reading order and does not render a `pre` element.
- [ ] Implement `ArchitectureFlow` as semantic HTML: an ordered sequence of Client → Next.js API → DeepSeek → streamed reading, with a separate compact component-tree note. Use CSS grid: horizontal on `md` and above; vertical on smaller widths. Do not add a runtime Mermaid dependency.
- [ ] Style only the flow edges and active/data nodes with restrained cyan/purple accents. At 375px all node labels and arrows must fit with no horizontal scroll.
- [ ] Replace the ASCII `<pre>` in `AboutContent` with `ArchitectureFlow`.
- [ ] Normalize user-facing Chinese to simplified Chinese: title, headings, technical labels, challenge labels, and portfolio callout. Retain English library names and code identifiers unchanged.
- [ ] Replace structural emoji in challenge and portfolio content with `OracleGlyph` or neutral text labels. Keep warning/success states textual as `问题` / `解法`, so color is not the only signal.
- [ ] Preserve the existing max-w-3xl reading measure, technical stack grid, and clean page-specific rule: no dense HUD or scanning decoration in article content.
- [ ] Run Jest, lint, then inspect `/about` at 375×812 and 1440×900.
- [ ] Commit with message: `feat: improve about page architecture story`.

**Acceptance criteria:** The page reads as a polished technical case study on mobile and desktop; the architecture remains scannable without horizontal scrolling.

### Task 6: Integrate visual quality checks and final regression pass

**Files:**
- Create: `e2e/visual-polish.spec.ts` if the repository’s current E2E setup supports Playwright tests; otherwise create/update `visual-check.cjs` using the existing harness.
- Modify: `README.md` only if a user-visible interaction changes require documentation (for example, card detail modal keyboard controls).

- [ ] Add executable browser checks for: demo reaches an interpretation; the compact reading sheet expands and collapses; card filtering works; a card dialog opens and closes via Escape; About architecture has no horizontal overflow at 375px.
- [ ] Run the project’s existing unit tests and lint. Run `pnpm build` to catch App Router and static rendering regressions.
- [ ] Use browser automation to inspect `/`, `/?demo`, `/cards`, and `/about` at 375×812, 768×1024, and 1440×900. Capture before/after screenshots from identical routes and scroll positions.
- [ ] Check keyboard-only paths: Tab focus visibility, opening card detail with keyboard, modal Escape/return focus, sheet expansion, and reset CTA.
- [ ] Check reduced motion, WebGL failure fallback, image failure fallback, and 200-character question input behavior. These behaviors must remain unchanged or improve.
- [ ] Compare page changes against the design system: deep-space is the only page background; neon effects do not convey information alone; no structural emoji remains; all controls meet the 44px minimum.
- [ ] Update README only if controls visibly changed; document `Esc` to close card detail and the compact/expanded reading sheet. Do not add implementation diary text.
- [ ] Commit with message: `test: verify visual polish experience`.

**Acceptance criteria:** Tests, lint, and production build pass. All key pages have intentional visual hierarchy at all three breakpoints, and feature behavior remains intact.

## Verification commands

Run these at the end of every task that changes code:

```powershell
pnpm lint
pnpm test
```

Run these before declaring the work complete:

```powershell
pnpm lint
pnpm test
pnpm build
```

For browser checks, use the project’s existing E2E command if present. If there is no package script, use the approved Playwright CLI against the local dev server and always take a fresh snapshot before interacting with element references.

## Non-regression checklist

- [ ] First-visit Braindance flow still reaches QuestionInput after the existing countdown.
- [ ] Custom API key verification UI and errors remain unchanged functionally.
- [ ] `/?demo` and `/?q=` complete without manual interaction.
- [ ] Three-card draw order, reversal orientation, texture lifecycle, and ErrorBoundary fallback still work.
- [ ] Reading abort, retry, streaming paragraph handling, fallback reading, and reset still work.
- [ ] Card images keep `next/image` optimization and failure fallback.
- [ ] No new horizontal page scrolling at 375px.
- [ ] `prefers-reduced-motion` removes nonessential motion.
- [ ] No CSS/visual change weakens text contrast or focus visibility.

## Suggested execution batches

1. **Foundation:** Task 1.
2. **Core result experience:** Tasks 2–3, with a manual demo check after each task.
3. **Supporting pages:** Tasks 4–5.
4. **Release gate:** Task 6.

Do not merge batches without passing their listed checks. Tasks 2 and 3 are sequential; Tasks 4 and 5 can be executed independently after Task 1.
