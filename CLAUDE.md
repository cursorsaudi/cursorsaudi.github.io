# CLAUDE.md — CursorSaudi.com

## Commands

```bash
pnpm install          # Install dependencies
npx astro dev         # Dev server (localhost:4321)
npx astro build       # Production build → ./dist
npx astro preview     # Preview production build
```

## Architecture

Astro 5 static site, single page (`src/pages/index.astro`). Bilingual (Arabic RTL default, English LTR) with client-side `localStorage` toggle. Dark mode only — no theme switcher.

### Stack

- **Framework**: Astro 5 (static SSG)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin (configured in `astro.config.ts`)
- **TypeScript**: Strict mode (`astro/tsconfigs/strict`)
- **Package manager**: pnpm
- **Deployment**: GitHub Pages via Actions (pnpm v9, Node 20) on push to `main`

### Path alias

`@/*` → `./src/*` (configured in `tsconfig.json`)

## Project Structure

```
src/
├── pages/index.astro          # Single page assembling all sections
├── layouts/Layout.astro       # Base HTML shell (dark mode, RTL/LTR, meta)
├── components/                # Astro components (Header, Hero, EventTimeline, EventCard, Partners, Footer, LangToggle)
├── config.ts                  # Site metadata, social links, ambassadors, partners (single source of truth)
├── content.config.ts          # Zod schema for event content collection
├── data/events/*.md           # Event markdown files (frontmatter-driven)
├── i18n/{ar,en}.json          # UI translation strings
├── i18n/index.ts              # getTranslation(lang, key) and t(lang, key) helpers
├── utils/events.ts            # getSortedEvents, getUpcomingEvents, getPastEvents, getEventsByStatus
└── styles/global.css          # Tailwind imports, dark theme CSS variables
public/
├── toggle-lang.js             # Runs before hydration to set <html dir/lang> from localStorage
└── CNAME                      # cursorsaudi.com
```

## Content Collections

Events live in `src/data/events/` as Markdown files. Schema defined in `src/content.config.ts` with Zod:

- **Required**: `title`, `date`, `location`, `description`, `type` (`"meetup" | "hackathon" | "workshop"`), `status` (`"planned" | "venue-pending" | "register-open" | "register-closed" | "completed" | "canceled"`)
- **Optional**: `titleAr`, `locationAr`, `descriptionAr`, `lumaUrl`, `speakers`, `slides`, `place`

`status` drives UI behavior: register buttons show only for `register-open`, canceled events are muted/strikethrough, and status badges are color-coded on EventCards. Access events only through `src/utils/events.ts` helpers.

## i18n

- JSON translation files: `src/i18n/ar.json`, `src/i18n/en.json`
- `public/toggle-lang.js` sets `<html dir>` and `lang` from `localStorage` before render (prevents layout flash)
- Components call `getTranslation(lang, key)` or `t(lang, key)` from `src/i18n/index.ts`

## Design Tokens (Dark Only)

- Background: `#0d1117` | Surface: `#161b22` | Border: `#30363d`
- Primary text: `#e6edf3` | Secondary: `#8b949e`
- Accent: `#58a6ff` | Accent hover: `#79c0ff`

## Conventions

- Components are stateless: props in, HTML out, no side effects
- Prefer pure functions in `utils/`
- `src/config.ts` is the single source of truth for site metadata, social links, and partners
- All content collection access goes through `src/utils/events.ts`
- `EventTimeline` is the single events section — highlights next upcoming + latest past event at top, remaining events below grouped by upcoming/past. No event duplication.
- Partners are configured in `src/config.ts` and rendered by `src/components/Partners.astro`
