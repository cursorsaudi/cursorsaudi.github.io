# Event Card Visual Mockup

ASCII representation of how the event cards look on the page.

---

## Desktop View (>400px width)

### Single Event Card - Meetup (Blue)

```
╔═════════════════════════════════════════════════════════════╗
║  MAY      │  meetup                              2026       ║
║   28      │                                                 ║
║  Wed      │  Cursor Saudi #1: Kickoff                      ║
║           │                                                 ║
║           │  📍 Riyadh                                      ║
║           │                                                 ║
║           │  Community launch event introducing Cursor     ║
║           │  Saudi and the 2025 meetup roadmap.            ║
║           │                                                 ║
║           │  👤 Abdullah Mosaibah, Dan (Cursor), Mazen     ║
║           │                                                 ║
║           │  ┌──────────────┐                              ║
║           │  │ سجّل الآن ↗  │  (Register button)           ║
║           │  └──────────────┘                              ║
╚═════════════════════════════════════════════════════════════╝
│<─ 80px ─>│<────────────── flex: 1 ──────────────────────>│
  Calendar              Event Content Body
   Block                (padding: 1.25rem × 1.4rem)
```

**Colors:**
- Calendar block background: rgba(59, 130, 246, 0.04) - very light blue tint
- Month "MAY": rgb(59, 130, 246) - solid blue
- Day "28": white/off-white (#f5f5f5)
- Weekday "Wed": gray (#555555)
- Top accent bar: rgba(59, 130, 246, 0.5) - semi-transparent blue
- Border: rgba(255, 255, 255, 0.08) - subtle white

---

### Single Event Card - Hackathon (Orange)

```
╔═════════════════════════════════════════════════════════════╗
║  APR      │  hackathon                           2026       ║
║   04      │                                                 ║
║  Thu      │  Cursor Build Sprint: Fintech MVPs             ║
║           │                                                 ║
║           │  📍 Riyadh                                      ║
║           │                                                 ║
║           │  Build sprint focused on rapid prototyping of  ║
║           │  fintech products with Cursor.                 ║
║           │                                                 ║
║           │  ┌──────────────┐                              ║
║           │  │ سجّل الآن ↗  │  (Register button)           ║
║           │  └──────────────┘                              ║
╚═════════════════════════════════════════════════════════════╝
```

**Colors:**
- Calendar block background: rgba(245, 158, 11, 0.04) - very light orange tint
- Month "APR": rgb(245, 158, 11) - solid orange
- Top accent bar: rgba(245, 158, 11, 0.5) - semi-transparent orange

---

### Single Event Card - Workshop (Green)

```
╔═════════════════════════════════════════════════════════════╗
║  JUL      │  workshop                            2025       ║
║   30      │                                                 ║
║  Wed      │  Build your MVP with AI!                       ║
║           │                                                 ║
║           │  📍 Riyadh                                      ║
║           │                                                 ║
║           │  Practical workshop on shipping MVPs faster    ║
║           │  with AI-assisted product and engineering.     ║
║           │                                                 ║
║           │  👤 Faris Hijazi, Mazen Alotaibi               ║
║           │                                                 ║
║           │  العروض: ↗ 1                                   ║
║           │  (Slides link for past event)                  ║
╚═════════════════════════════════════════════════════════════╝
```

**Colors:**
- Calendar block background: rgba(16, 185, 129, 0.04) - very light green tint
- Month "JUL": rgb(16, 185, 129) - solid green
- Top accent bar: rgba(16, 185, 129, 0.5) - semi-transparent green

---

## Grid Layout View (3 Cards)

```
╔════════════════════╗  ╔════════════════════╗  ╔════════════════════╗
║ MAY │ meetup      2026  ║ JUL │ workshop    2025  ║ AUG │ meetup      2025
║  28 │ Kickoff        ║  30 │ Build your  ║   05 │ Introduction to
║ Wed │                ║ Wed │ MVP with AI ║  Tue │ Cursor (Khobar)
║     │ 📍 Riyadh       ║     │ 📍 Riyadh    ║      │ 📍 Khobar
║     │ Community      ║     │ Practical   ║      │ Beginner-friendly
║     │ launch event   ║     │ workshop... ║      │ introduction...
║     │ 👤 3 speakers  ║     │ 👤 2 speakers ║     │ 👤 1 speaker
║     │ [Register ↗]   ║     │ [Slides: 1] ║      │ [Slides: 1]
╚════════════════════╝  ╚════════════════════╝  ╚════════════════════╝

<─────── 1.25rem gap ────><─────── 1.25rem gap ────>

Grid: repeat(auto-fill, minmax(320px, 1fr))
Container max-width: 1200px
```

---

## Mobile View (<400px width)

Calendar block transforms to horizontal layout:

```
╔═══════════════════════════════════════╗
║ MAY | 28 | Wed                        ║  ← Horizontal calendar
║─────────────────────────────────────║
║  meetup                        2026  ║
║                                      ║
║  Cursor Saudi #1: Kickoff            ║
║                                      ║
║  📍 Riyadh                            ║
║                                      ║
║  Community launch event introducing  ║
║  Cursor Saudi and the 2025 meetup    ║
║  roadmap.                            ║
║                                      ║
║  👤 Abdullah, Dan, Mazen             ║
║                                      ║
║  ┌─────────────┐                     ║
║  │ سجّل الآن ↗ │                     ║
║  └─────────────┘                     ║
╚═══════════════════════════════════════╝

Stack: flex-direction: column
Calendar becomes horizontal bar at top
Border moves from right to bottom
```

---

## RTL (Arabic) View

In RTL mode, the entire card flips:

```
╔═════════════════════════════════════════════════════════════╗
║  2026                       meetup      │       MAY        ║
║                                         │        28        ║
║            الانطلاقة - كيرسر السعودية #1   │       Wed        ║
║                                         │                 ║
║                                 الرياض 📍 │                 ║
║                                         │                 ║
║      حدث إطلاق المجتمع يقدم كيرسر السعودية  │                 ║
║                   .وخطة اللقاءات لعام 2025  │                 ║
║                                         │                 ║
║      عبدالله المصيبح، دان، مازن العتيبي 👤 │                 ║
║                                         │                 ║
║                   ┌──────────────┐      │                 ║
║                   │ ↗ سجّل الآن  │      │                 ║
║                   └──────────────┘      │                 ║
╚═════════════════════════════════════════════════════════════╝
│<────────────── flex: 1 ──────────────────────>│<─ 80px ─>│
           Event Content Body                     Calendar
       (padding: 1.25rem × 1.4rem)                 Block
```

**Key RTL Changes:**
- Calendar block moves from left to right side
- Border moves from right edge to left edge of calendar block
- Arabic text flows right-to-left
- All content is right-aligned
- Icons remain on the right side (logical positioning)

---

## Hover State

When hovering over a card:

```
╔═════════════════════════════════════════════════════════════╗
║  MAY      │  meetup                              2026       ║   ↑
║   28      │                                                 ║   │
║  Wed      │  Cursor Saudi #1: Kickoff                      ║   │ translateY(-2px)
║           │  ...                                            ║   │
╚═════════════════════════════════════════════════════════════╝   │
      ╰────────────── Shadow & Glow ──────────────╯

Effects:
1. Card lifts up 2px (translateY(-2px))
2. Shadow: 0 8px 30px rgba(0, 0, 0, 0.3)
3. Glow: 0 0 40px rgba(59, 130, 246, 0.04)
4. Gradient border appears (::before pseudo-element)
   - linear-gradient(135deg, rgba(59, 130, 246, 0.15), transparent 50%)
5. Background slightly lighter (surface-hover)
6. Border slightly lighter (border-hover)
```

---

## Detailed Calendar Block Anatomy

```
┌─────────────────────┐
│ ─────────────────── │ ← Top accent bar (2px, colored)
│                     │
│        MAY          │ ← Month (0.68rem, bold, colored)
│                     │
│         28          │ ← Day (1.75rem, ultra-bold, white)
│                     │
│        Wed          │ ← Weekday (0.65rem, medium, gray)
│                     │
└─────────────────────┘
│                     │ ← Right border (1px, subtle white)
  80px min-width
  Background: rgba(accent, 0.04)
  Padding: 1.2rem × 0.6rem
  Centered vertically & horizontally
```

---

## Typography Scale in Context

```
Hero Title:     ████████████  (clamp(2.8rem, 7vw, 5rem))
Section Heading: ██████        (clamp(1.5rem, 3vw, 2.2rem))
Event Title:     ████          (1.1rem, bold)
Calendar Day:    ████          (1.75rem, ultra-bold) ← Prominent!
Calendar Month:  ██            (0.68rem, colored)    ← Small but visible
Body Text:       ███           (0.85rem)
Calendar Weekday: █            (0.65rem, subtle)
Metadata:        ██            (0.72-0.82rem)
```

---

## Color Palette Applied to Cards

### Dark Background
- Card background: `rgba(255, 255, 255, 0.03)` + backdrop-blur(20px)
- Page background: `#0a0a0a` (deep black)

### Text Colors
- Primary (titles): `#f5f5f5` (off-white)
- Secondary (descriptions): `#888888` (medium gray)
- Tertiary (metadata): `#555555` (dark gray)

### Accent Colors (Type-Specific)
- **Meetup:** `#3b82f6` (blue)
- **Hackathon:** `#f59e0b` (orange)
- **Workshop:** `#10b981` (green)

### Borders
- Default: `rgba(255, 255, 255, 0.08)` (8% white)
- Hover: `rgba(255, 255, 255, 0.15)` (15% white)

---

## Spacing System

```
Section padding:   ████████  (4rem top, 2rem bottom)
Card gap:          ██        (1.25rem between cards)
Card body padding: ███       (1.25rem × 1.4rem)
Calendar padding:  ██        (1.2rem × 0.6rem)
Element gaps:      █         (0.5rem inside card)
Micro gaps:        ▌         (0.1-0.35rem for inline items)
```

---

## Responsive Grid Behavior

### Desktop (>1200px container width)
```
[ Card ]  [ Card ]  [ Card ]  [ Card ]
[ Card ]  [ Card ]  [ Card ]  [ Card ]
```
4 columns × 320px minimum

### Tablet (~800px container width)
```
[ Card ]  [ Card ]  [ Card ]
[ Card ]  [ Card ]  [ Card ]
```
3 columns × 320px minimum

### Mobile (~500px container width)
```
[ Card ]  [ Card ]
[ Card ]  [ Card ]
```
2 columns × 320px minimum

### Small Mobile (<400px)
```
[ Card ]
[ Card ]
[ Card ]
```
1 column, stacked layout
Calendar bar horizontal at top

---

**This visual mockup represents the actual rendered design based on the EventCard.astro component code.**
