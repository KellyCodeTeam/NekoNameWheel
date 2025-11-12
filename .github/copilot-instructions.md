# Neko Name Wheel - AI Coding Agent Instructions

## Project Overview
A client-side vanilla JavaScript wheel-of-names spinner with lucky cat (Maneki-neko) theming. No build tools, no frameworks—pure HTML/CSS/JS deployed as static files.

## Architecture & Data Flow

**Single-Page App Structure:**
- `index.html` - Main wheel interface with embedded canvas, modal, and toast
- `script.js` - Self-contained global state machine (~500 lines)
- `styles.css` - CSS custom properties with mobile-first responsive design
- Static pages: `about.html`, `contact.html`, `privacy.html`, `terms.html`

**State Management:**
- Global state object in `script.js` (lines 4-7): `names[]`, `isSpinning`, `soundEnabled`, `rotation`
- Persistence: localStorage for names (`savedNames`) and sound preference (`soundEnabled`)
- URL state: Base64-encoded names in query param for sharing (`?names=<base64>`)

**Wheel Rendering Pipeline:**
1. Canvas is 900x900px fixed, CSS-scaled responsively
2. `drawWheel()` redraws full wheel on every state change (no dirty regions)
3. Dynamic font sizing based on name count: 36px → 24px (3-50 names)
4. Text fitting: measure → shrink font → truncate with "..." if still overflows
5. 8-color palette cycles: `wheelColors[index % 8]`

**Spin Algorithm (CRITICAL):**
- Winner pre-selected via `Math.random()` before animation starts (line 268)
- Destination angle calculated to align winner's segment middle with top pointer (270°)
- Animation: quartic ease-out over 6.5s with 5-8 full rotations
- Pointer is FIXED at top; wheel rotates beneath it
- Do NOT change spin math without testing—alignment is pixel-perfect

## Key Conventions

**No Build Step:**
- Direct file references: `<script src="./script.js">` (relative paths with `./`)
- No transpilation, bundling, or minification in dev workflow
- CSS variables in `:root` for theming (lines 2-13 in `styles.css`)

**SEO-Heavy HTML:**
- Schema.org JSON-LD in `<head>` (WebApplication type)
- FAQ schema with `itemscope`/`itemprop` microdata
- Meta descriptions, OG tags on all pages
- Keyword-stuffed but natural content ("wheel of names", "random name picker")

**Accessibility:**
- ARIA labels on canvas (`aria-label="Name wheel"`)
- Modal uses `role="dialog"`, `aria-modal="true"`
- Keyboard shortcuts: Ctrl+Enter to spin, Escape to close modal
- `prefers-reduced-motion` media query disables animations

**Canvas Text Rendering:**
Always use this pattern when drawing text (lines 215-246):
```javascript
ctx.font = `bold ${fontSize}px Arial, sans-serif`;
ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
ctx.shadowBlur = 4;
// Measure → scale → truncate loop
```

## Developer Workflows

**Local Development:**
- Open `index.html` directly in browser (file:// protocol works)
- No server required for basic testing
- Use Live Server extension for hot reload (optional)

**Testing the Spin:**
- Add 3-10 names, spin multiple times, verify winner alignment with top pointer
- Test edge cases: 3 names (min), 50 names (max), long names (truncation)
- Check winner modal shows correct name, "Remove" button updates wheel

**Sound Testing:**
- Sounds preloaded in `init()` but may fail silently in browser
- Toggling sound updates localStorage immediately
- Files: `sounds/chimewheel.mp3` (spin), `sounds/applause.mp3` (winner)

**Deployment:**
- Upload all files to static host (no server-side code)
- Ensure `images/cat.jpg` and `sounds/*.mp3` paths resolve
- Test share links: they encode names in URL, must decode on load

## Critical Files & Patterns

**State Synchronization (script.js:84-100):**
When names change: `updateNames() → saveNames() → drawWheel()`
Always call all three to keep textarea, array, localStorage, and canvas in sync.

**Modal System (script.js:303-331):**
- Winner stored in `currentWinner` global for removal
- Auto-hides after 5s unless user interacts
- "Remove" button filters textarea lines, triggers full update cycle

**Responsive Wheel (styles.css:138-158):**
Grid layout switches to single column <1024px. Textarea has `margin-left: 140px` on desktop (line 297)—intentional positioning hack for 3-column grid.

**Share Feature (script.js:363-388):**
Uses base64 encoding of newline-separated names. Escapes with `unescape(encodeURIComponent())` for Unicode support. Falls back to `document.execCommand('copy')` on older browsers.

## Common Pitfalls

1. **Don't modify rotation calculation** (lines 268-283) without understanding modulo math—off-by-one errors break alignment
2. **Canvas text must set font BEFORE measuring** (`ctx.font` then `ctx.measureText()`)
3. **localStorage can fail** (private browsing, quota)—wrap in try/catch
4. **CSS var names use kebab-case** (`--color-pink` not `--colorPink`)
5. **Sound autoplay blocked** by browsers until user interaction—acceptable UX

## External Dependencies
None. Zero npm packages, no CDNs. All assets local.
