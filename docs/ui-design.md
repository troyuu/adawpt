# Adawpt — UI Design System

## Overview

Adawpt's design system is warm, approachable, and trustworthy — reflecting the compassion of animal rescue work while maintaining professionalism for LGU/NGO partners. The design uses a playful orange primary color paired with calming teal accents.

---

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#F97316` | Main brand color, CTAs, active states |
| `--color-primary-hover` | `#EA580C` | Hover/pressed state for primary |
| `--color-secondary` | `#14B8A6` | Secondary actions, success accents |
| `--color-secondary-hover` | `#0D9488` | Hover/pressed for secondary |
| `--color-accent` | `#F59E0B` | Highlights, badges, featured items |

### Semantic Colors
| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#10B981` | Success states, confirmations |
| `--color-danger` | `#EF4444` | Errors, destructive actions |
| `--color-warning` | `#F59E0B` | Warnings, pending states |
| `--color-info` | `#3B82F6` | Informational messages |

### Neutral Colors (Tailwind defaults)
- `gray-50` (#F9FAFB) — Page backgrounds
- `gray-100` (#F3F4F6) — Card backgrounds, alternating rows
- `gray-200` (#E5E7EB) — Borders, dividers
- `gray-300` (#D1D5DB) — Disabled states
- `gray-500` (#6B7280) — Placeholder text, secondary text
- `gray-700` (#374151) — Body text
- `gray-900` (#111827) — Headings, primary text

---

## Typography

### Font Families
| Token | Font | Usage |
|---|---|---|
| `--font-display` | Poppins | Headings, hero text, brand elements |
| `--font-sans` | Inter | Body text, UI elements, forms |

### Type Scale
| Element | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| H1 (Hero) | Poppins | 3rem (48px) | 700 | 1.1 |
| H2 (Section) | Poppins | 2rem (32px) | 600 | 1.2 |
| H3 (Card title) | Poppins | 1.5rem (24px) | 600 | 1.3 |
| H4 (Subsection) | Poppins | 1.25rem (20px) | 600 | 1.4 |
| Body | Inter | 1rem (16px) | 400 | 1.6 |
| Body small | Inter | 0.875rem (14px) | 400 | 1.5 |
| Caption | Inter | 0.75rem (12px) | 400 | 1.4 |
| Button | Inter | 0.875rem (14px) | 500 | 1 |

### Google Fonts Import
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## Tailwind v4 Theme Configuration

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: #F97316;
  --color-primary-hover: #EA580C;
  --color-secondary: #14B8A6;
  --color-secondary-hover: #0D9488;
  --color-accent: #F59E0B;
  --color-success: #10B981;
  --color-danger: #EF4444;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;

  /* Typography */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Poppins', ui-sans-serif, system-ui, sans-serif;
}
```

**Usage in components:**
```html
<h1 class="font-display text-4xl font-bold text-gray-900">...</h1>
<p class="font-sans text-base text-gray-700">...</p>
<button class="bg-primary hover:bg-primary-hover text-white">...</button>
<span class="text-secondary">...</span>
```

---

## Spacing & Layout

### Spacing Scale
Uses Tailwind's default spacing scale (0.25rem increments): 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24

### Container
- Max width: 1280px (`max-w-7xl`)
- Padding: 1rem mobile, 1.5rem tablet, 2rem desktop
- Centered with `mx-auto`

### Grid System
- 12-column grid on desktop
- Card grids: 1 col mobile → 2 col tablet → 3-4 col desktop
- Dashboard: Sidebar (256px fixed) + main content (fluid)

### Breakpoints (Tailwind defaults)
| Breakpoint | Min Width | Description |
|---|---|---|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## Component Specifications

### Button
```
Variants: primary, secondary, outline, ghost, danger
Sizes: sm (h-8 px-3 text-xs), md (h-10 px-4 text-sm), lg (h-12 px-6 text-base)
States: default, hover, active, disabled, loading
Border radius: rounded-lg (0.5rem)
Transition: transition-colors duration-150
```

**Primary Button:**
```html
<button class="h-10 px-4 bg-primary hover:bg-primary-hover text-white font-medium
               rounded-lg transition-colors duration-150 disabled:opacity-50
               disabled:cursor-not-allowed">
  Button Text
</button>
```

### Card
```
Background: white
Border: border border-gray-200
Border radius: rounded-xl (0.75rem)
Shadow: shadow-sm, hover:shadow-md (interactive cards)
Padding: p-6
Transition: transition-shadow duration-200
```

### Input / Select / Textarea
```
Height: h-10 (input/select), min-h-24 (textarea)
Border: border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20
Border radius: rounded-lg
Padding: px-3
Font: text-sm
Label: text-sm font-medium text-gray-700 mb-1
Error: text-sm text-danger mt-1, border-danger
```

### Badge / Status Badge
```
Padding: px-2.5 py-0.5
Font: text-xs font-medium
Border radius: rounded-full

Status colors:
- Available: bg-success/10 text-success
- Pending: bg-warning/10 text-warning
- Adopted: bg-primary/10 text-primary
- Critical: bg-danger/10 text-danger
- Closed: bg-gray-100 text-gray-600
```

### Modal
```
Overlay: bg-black/50 backdrop-blur-sm
Container: bg-white rounded-2xl shadow-2xl max-w-lg mx-auto
Header: px-6 py-4 border-b border-gray-200
Body: px-6 py-4
Footer: px-6 py-4 border-t border-gray-200 flex justify-end gap-3
Animation: fade-in + scale-up
```

### Toast / Alert
```
Position: fixed top-4 right-4
Max width: 400px
Border radius: rounded-lg
Shadow: shadow-lg
Variants: success (green), error (red), warning (amber), info (blue)
Auto-dismiss: 5 seconds
```

### Avatar
```
Sizes: sm (h-8 w-8), md (h-10 w-10), lg (h-12 w-12), xl (h-16 w-16)
Shape: rounded-full
Fallback: Initials on colored background
Border: ring-2 ring-white (when overlapping)
```

---

## Page Layouts

### Public Layout
```
┌──────────────────────────────────────────────┐
│  Navbar (h-16, white, shadow-sm, sticky)     │
│  [Logo] [Animals] [Report] [Stories] [Login] │
├──────────────────────────────────────────────┤
│                                              │
│              Page Content                    │
│          (max-w-7xl mx-auto)                 │
│                                              │
├──────────────────────────────────────────────┤
│  Footer (bg-gray-900, text-white)            │
│  [About] [Links] [Contact] [Social]          │
└──────────────────────────────────────────────┘
```

### Dashboard Layout
```
┌──────────────────────────────────────────────┐
│  Navbar (h-16, white, shadow-sm)             │
│  [Logo] [Search] [Notifications] [Profile]   │
├─────────┬────────────────────────────────────┤
│ Sidebar │                                    │
│ (w-64)  │        Main Content                │
│         │      (flex-1, p-6)                 │
│ [Nav]   │                                    │
│ [Items] │                                    │
│         │                                    │
│         │                                    │
└─────────┴────────────────────────────────────┘
```

### Mobile Navigation
- Hamburger menu icon in navbar
- Full-screen slide-out menu panel
- Dashboard sidebar becomes bottom navigation or collapsible drawer

---

## Key Page Designs

### Landing Page
```
┌─ Hero Section ────────────────────────────────┐
│ bg-gradient-to-r from-primary/10 to-white     │
│ H1: "Give a Stray a Second Chance"            │
│ Subtitle + [Report a Stray] [Adopt Now] CTAs  │
│ Hero illustration/photo                        │
├─ Stats Bar ───────────────────────────────────┤
│ [🐕 500+ Rescued] [🏠 300+ Adopted]           │
│ [👥 100+ Volunteers] [💝 ₱1M+ Donated]        │
├─ Featured Animals ────────────────────────────┤
│ H2: "Looking for a Home"                      │
│ 4-column AnimalCard grid                      │
│ [View All Animals →]                          │
├─ How It Works ────────────────────────────────┤
│ 4 steps: Report → Rescue → Rehabilitate →     │
│          Rehome with icons                     │
├─ Success Stories ─────────────────────────────┤
│ 3 story cards with photos                     │
│ [Read More Stories →]                         │
├─ CTA Section ─────────────────────────────────┤
│ "Join Our Community" + Register button        │
└───────────────────────────────────────────────┘
```

### Animal Card
```
┌──────────────────────┐
│ ┌──────────────────┐ │
│ │   Animal Photo    │ │ (aspect-[4/3], object-cover)
│ │                   │ │
│ └──────────────────┘ │
│ [Available] badge     │
│ Animal Name (H3)      │
│ Breed • Age • Gender  │ (text-sm text-gray-500)
│ ───────────────────── │
│ [🐕 Dog] [♀ Female]   │ (tag badges)
│ [View Profile →]      │
└──────────────────────┘
```

### Animal Detail Page
```
┌─ Image Gallery (carousel) ────────────────────┐
│ [Main photo]  [thumb] [thumb] [thumb]          │
├─ Info Grid ───────────────────────────────────┤
│ Left (2/3):                                    │
│   Name, Description                            │
│   Details table (breed, age, weight, etc.)     │
│   Temperament tags                             │
│   Medical timeline                             │
│ Right (1/3):                                   │
│   Status badge                                 │
│   [Adopt This Animal] CTA                     │
│   Share buttons                                │
│   Shelter info card                            │
└───────────────────────────────────────────────┘
```

### Report Form (Multi-step Wizard)
```
Step indicator: ① Location  ② Details  ③ Photos  ④ Review

Step 1 — Location:
  - Map picker (or manual address input)
  - Barangay/City selector

Step 2 — Details:
  - Animal type (dog/cat/bird/other)
  - Description textarea
  - Urgency selector with descriptions
  - Condition checkboxes

Step 3 — Photos:
  - Drag & drop / click to upload
  - Up to 5 photos
  - Preview thumbnails with remove button

Step 4 — Review:
  - Summary of all entered info
  - Optional contact info (name, phone, email)
  - Submit button

Confirmation:
  - Tracking ID displayed prominently
  - "Save this ID to check your report status"
```

---

## Iconography

Using **Lucide React** icon set for consistency:
- Navigation: Home, PawPrint, AlertTriangle, Heart, HandHeart, BarChart3
- Actions: Plus, Edit, Trash2, Eye, Search, Filter, Download, Upload
- Status: CheckCircle, XCircle, Clock, AlertCircle
- UI: ChevronDown, ChevronRight, Menu, X, Bell, User, Settings, LogOut

---

## Animation & Transitions

| Element | Animation | Duration |
|---|---|---|
| Page transitions | Fade in | 200ms |
| Cards on hover | Shadow lift | 200ms |
| Modals | Fade + scale up | 150ms |
| Dropdown menus | Slide down + fade | 150ms |
| Toast notifications | Slide in from right | 300ms |
| Loading skeletons | Pulse | 2s loop |
| Button hover | Color transition | 150ms |

### CSS for skeleton loading:
```css
.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}
```

---

## Responsive Design Rules

1. **Mobile-first approach** — Base styles for mobile, scale up with breakpoints
2. **Touch targets** — Minimum 44x44px on mobile
3. **Card grids** — 1 col → 2 col (md) → 3 col (lg) → 4 col (xl)
4. **Sidebar** — Hidden on mobile, visible on lg+
5. **Tables** — Horizontal scroll wrapper on mobile, or convert to card layout
6. **Images** — Responsive with `object-cover` and proper aspect ratios
7. **Typography** — Scale down headings on mobile (text-2xl → text-xl on mobile)
8. **Navigation** — Hamburger menu on mobile, full horizontal on desktop
9. **Forms** — Full width on mobile, max-width on desktop
10. **Modals** — Full screen on mobile, centered overlay on desktop

---

## Accessibility Guidelines

- All images have descriptive `alt` text
- Form inputs have associated `<label>` elements
- Focus visible on all interactive elements (`focus-visible:ring-2 focus-visible:ring-primary`)
- Skip to main content link
- ARIA labels on icon-only buttons
- Role attributes on custom components
- Color is never the only indicator (always paired with text/icon)
- Error messages linked to inputs via `aria-describedby`
- Keyboard navigable menus and modals (Escape to close)
