# CLAUDE.md — CursorSaudi.com

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # astro dev on localhost:4321
pnpm check            # astro check (TypeScript + Astro diagnostics)
pnpm build            # Production build → ./dist
pnpm preview          # Preview production build
```

## Architecture

Astro 5 static site with multiple routes under `src/pages/` (home, events, albums, about, ambassadors, partnerships, thank you, blog, speakers, partners). Bilingual (Arabic RTL default, English LTR) with client-side `localStorage` toggle. Dark mode only — no theme switcher.

### Stack

- **Framework**: Astro 5 (static SSG)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin (configured in `astro.config.ts`)
- **TypeScript**: Strict mode (`astro/tsconfigs/strict`)
- **Package manager**: pnpm
- **Deployment**: Cloudflare Pages via GitHub Actions (`pnpm check` → `pnpm build` → `wrangler pages deploy`) on push to `main`

### Path alias

`@/*` → `./src/*` (configured in `tsconfig.json`)

## Project Structure

```
src/
├── pages/*.astro              # Routes (index, events, albums, about, …)
├── layouts/Layout.astro       # Base HTML shell (dark mode, RTL/LTR, meta, canonical + og:url)
├── components/                # Header, HomePage, EventsPage, Footer, LangToggle, …
├── config.ts                  # Site metadata, social links, ambassadors, partners (single source of truth)
├── content.config.ts          # Zod schema for events + blog collections
├── data/events/*.md           # Event markdown files (frontmatter-driven)
├── utils/events.ts            # getSortedEvents, getUpcomingEvents, getPastEvents, …
├── utils/validate-site-config.ts  # assertSiteConfigPublicAssets — run from astro.config.ts at build
└── styles/global.css          # Tailwind imports, dark theme CSS variables
public/
├── toggle-lang.js             # Runs early from Layout to set <html dir/lang> from localStorage
└── CNAME                      # cursorsaudi.com
```

## Content Collections

Events live in `src/data/events/` as Markdown files. Schema defined in `src/content.config.ts` with Zod:

- **Required**: `title`, `date`, `location`, `description`, `type` (`"meetup" | "hackathon" | "workshop" | "build"`), `status` (`"backlog" | "informed" | "venue-pending" | "register-open" | "register-closed" | "concluded" | "canceled"`)
- **Optional**: `titleAr`, `locationAr`, `descriptionAr`, `lumaUrl`, `speakers`, `slides`, `venue`, `photos`, `videos`, `coverPhoto`

`status` drives UI behavior on list pages (e.g. register links, canceled styling). Access events only through `src/utils/events.ts` helpers.

## i18n

- UI copy uses paired `<span class="lang-ar">` / `<span class="lang-en">` blocks toggled in CSS
- `public/toggle-lang.js` is loaded from `Layout.astro` so `<html dir>` and `lang` match `localStorage` before paint

## Design Tokens (Dark Only)

- Background: `#0F0F0F` | Surface: `#171717` | Surface highlight: `#1F1F1F` | Border: `#252525`
- Primary text: `#FFFFFF` | Muted: `#999999` | Dim: `#6E6E6E`
- Primary CTA: white bg / black text (`.btn-primary`) | Accent CTA: `#58a6ff` bg (`.btn-accent`) | Accent hover: `#79c0ff`

## Conventions

- Components are stateless: props in, HTML out, no side effects
- Prefer pure functions in `utils/`
- `src/config.ts` is the single source of truth for site metadata, social links, and partners
- All content collection access goes through `src/utils/events.ts`
- Events listing lives in `src/components/EventsPage.astro`; the home page shows featured cards via `HomePage.astro`
- Partners are configured in `src/config.ts` and rendered inline where needed (e.g. home, about)
