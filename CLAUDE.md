# CLAUDE.md — CursorSaudi.com

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Sync events from ~/Vault (soft) → astro dev on localhost:4321
pnpm sync-events      # Manually run the bidirectional Vault ↔ repo sync
pnpm check            # astro check (TypeScript + Astro diagnostics)
pnpm build            # Production build → ./dist (no sync; uses committed markdown)
pnpm preview          # Preview production build
```

Always use `pnpm dev` (not `npx astro dev`) — it triggers the event sync first.

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

### Vault ↔ repo bidirectional sync

`scripts/sync-events.mjs` keeps `src/data/events/` and `public/events/` in sync with the maintainer's Obsidian Vault at `~/Vault/cursorsaudi/events/` (markdown) and `~/Vault/__media/` (images/videos). Key behaviors:

- **Bidirectional**: new files on either side propagate to the other. For files that exist on both sides, content is compared after applying the Vault → repo transform; only genuine differences trigger a sync, with newer mtime winning conflicts. After every sync the two sides' mtimes are aligned so subsequent runs see them as in-sync.
- **Vault → repo transformations**: strips Obsidian-only fields (`created`, `modified`, `status_obs`, `published`); converts `![[file]]` wikilinks to `![](/events/<slug>/<file>)`; populates `photos`/`videos`/`coverPhoto` from referenced media; applies fallbacks for required fields when the Vault has incomplete drafts (slug→title-case, filename→date, invalid `type`→`meetup`, invalid `status`→`backlog`); copies referenced media from `~/Vault/__media/` into `public/events/<slug>/`.
- **Repo → vault transformations**: strips auto-generated fields (`photos`, `coverPhoto`, `videos`); converts markdown image links back to wikilinks; preserves any existing `created`/`modified` fields on the Vault destination so Obsidian metadata isn't clobbered; copies media back to `~/Vault/__media/` (warns on flat-folder name collisions).
- **Soft mode** (`--soft`): used by `pnpm dev` so the script silently exits when `~/Vault` isn't present (CI machines, contributors without the Vault).
- **CI**: GitHub Actions runs `pnpm check` and `pnpm build` from committed markdown — no sync, no Vault checkout. The Vault dependency is purely a local convenience.
- **Manual override flags**: `--vault-wins`, `--repo-wins`, `--dry-run`, `--vault-path <path>`.

**Never** commit to `src/data/events/` or `public/events/` directly without running `pnpm sync-events` first if the Vault is reachable — otherwise the next sync will see drift and may overwrite the freshly-committed file.

## i18n

- UI copy uses paired `<span class="lang-ar">` / `<span class="lang-en">` blocks toggled in CSS
- `public/toggle-lang.js` is loaded from `Layout.astro` so `<html dir>` and `lang` match `localStorage` before paint

## Design Tokens (Dark Only)

- Background: `#0d1117` | Surface: `#161b22` | Border: `#30363d`
- Primary text: `#e6edf3` | Secondary: `#8b949e`
- Accent: `#58a6ff` | Accent hover: `#79c0ff`

## Conventions

- Components are stateless: props in, HTML out, no side effects
- Prefer pure functions in `utils/`
- `src/config.ts` is the single source of truth for site metadata, social links, and partners
- All content collection access goes through `src/utils/events.ts`
- Events listing lives in `src/components/EventsPage.astro`; the home page shows featured cards via `HomePage.astro`
- Partners are configured in `src/config.ts` and rendered inline where needed (e.g. home, about)
