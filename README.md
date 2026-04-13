# cursorsaudi.com

Community website for **Cursor Saudi** — the AI-native developer community in Saudi Arabia.

Live at [cursorsaudi.com](https://cursorsaudi.com).

## Quick start

```bash
pnpm install        # Install dependencies
pnpm dev            # Sync events from Obsidian Vault (optional) + dev server on localhost:4321
pnpm check          # TypeScript + Astro diagnostics
pnpm build          # Production build → ./dist
pnpm preview        # Preview production build locally
```

Always use `pnpm dev` instead of `npx astro dev` — it triggers the event sync script first.

## Stack

| Layer        | Tech                                                     |
| ------------ | -------------------------------------------------------- |
| Framework    | [Astro 5](https://astro.build) (static SSG)             |
| Styling      | [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite` |
| Language     | TypeScript (strict)                                      |
| Package mgr  | pnpm                                                     |
| Deployment   | Cloudflare Pages via GitHub Actions                      |
| Domain       | cursorsaudi.com (CNAME in `public/`)                     |

## Features

- **Bilingual**: Arabic (RTL, default) and English (LTR) with a client-side toggle stored in `localStorage`
- **Dark mode only**: Single dark color scheme, no theme switcher
- **Content collections**: Events in `src/data/events/` with Zod-validated frontmatter
- **Per-page table of contents**: Horizontal pill nav linking to page sections
- **Obsidian Vault sync**: Bidirectional sync between `src/data/events/` and a local Obsidian Vault (optional, local-only)

## Pages

| Route             | Description                                      |
| ----------------- | ------------------------------------------------ |
| `/`               | Home — hero, stats, featured events, partners    |
| `/events`         | Full events listing (upcoming + past with recaps)|
| `/albums`         | Photo and video galleries from past events       |
| `/about`          | Mission, event types, chapters, team             |
| `/ambassadors`    | Cursor ambassador program info and FAQ           |
| `/partnerships`   | How to work with Cursor Saudi                    |
| `/thankyou`       | Speakers, supporters, and community partners     |
| `/blog/[slug]`    | Individual event recap posts                     |
| `/speakers/[slug]`| Speaker profile pages                            |
| `/partners/[slug]`| Partner profile pages                            |

## Project structure

```
src/
├── pages/              Routes (index, events, albums, about, …)
├── layouts/Layout.astro  Base HTML shell (dark mode, RTL/LTR, meta, canonical)
├── components/         Page components, Header, Footer, PageToc, LangToggle, …
├── config.ts           Site metadata, social links, ambassadors, partners
├── content.config.ts   Zod schema for events + blog collections
├── data/events/        Event Markdown files (frontmatter-driven)
├── utils/              Helper functions (events, blog, people, validation)
└── styles/global.css   Tailwind imports and dark theme CSS variables
public/
├── toggle-lang.js      Sets <html dir/lang> from localStorage before paint
├── logos/              Partner logos
├── images/             Static images
└── CNAME               cursorsaudi.com
```

## i18n

UI copy uses paired `<span class="lang-ar">` / `<span class="lang-en">` elements toggled via CSS. The `public/toggle-lang.js` script runs before first paint so the layout direction matches the stored language preference.

## Community language policy

- **Cursor Saudi ambassadors** must be fluent in both Arabic and English. Slides can be in either language, but ambassadors present in Arabic using normal, everyday language.
- **Guest speakers** can be English-only — international speakers are welcome. Slides can be in either language.

## Deployment

CI runs on every push to `main`:

1. `pnpm install --frozen-lockfile`
2. `pnpm check` (TypeScript + Astro diagnostics)
3. `pnpm build`
4. `wrangler pages deploy ./dist`

See `.github/workflows/deploy.yml` for the full workflow.

## Contributing

- `src/config.ts` is the single source of truth for site metadata, social links, ambassadors, and partners
- All content collection access goes through utility functions in `src/utils/`
- Components are stateless: props in, HTML out, no side effects
- If you have access to the Obsidian Vault, run `pnpm sync-events` before committing event changes

## License

Community project by [Cursor Saudi](https://x.com/cursorsaudi).
