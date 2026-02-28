# Apply Apple Vision Pro Glassmorphism Design System

Apply a full Apple Vision Pro–inspired glassmorphism redesign to this React + Tailwind CSS v4 project. The design uses neutral frosted-glass panels (no coloured blobs, no blue/indigo tints) floating over a background image.

## Reusable UI Components to Create

Create the following in `src/components/ui/`:

### GlassCard.tsx
```tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.35)] overflow-hidden ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
```

### GlassButton.tsx
- 4 variants: `primary` (`bg-white/20`), `secondary` (`bg-white/10`), `ghost` (transparent + border), `danger` (`bg-red-500/20`)
- 3 sizes: `sm`, `md`, `lg`
- Also export `glassButtonClass(variant, size, extra)` helper — use this on `<Link>` elements to avoid invalid HTML (`<button>` inside `<a>`)
- Base: `backdrop-blur-md rounded-xl font-medium transition-all duration-150`

### GlassInput.tsx
- Export `GlassInput` (wraps `<input>`) and `GlassTextarea` (wraps `<textarea>`)
- Both accept optional `label` prop rendered as `text-xs font-medium text-white/50 uppercase tracking-wide`
- Input base classes: `w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/45 focus:bg-white/15 transition-all duration-150 backdrop-blur-sm`

---

## Background Setup

Identify the background image asset in `src/assets/`. Apply it on the root layout wrapper:

```tsx
import bgImage from '../../assets/background-image.jpg';

<div
  className="flex h-screen overflow-hidden relative"
  style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
>
  <div className="absolute inset-0 bg-black/30 pointer-events-none" />
  {/* sidebar + content here, all relative z-10 */}
</div>
```

Apply the same background + overlay pattern to the Login page (which sits outside the main layout).

---

## Layout Components

**Sidebar**: `relative z-10 backdrop-blur-xl bg-white/8 border-r border-white/15 text-white`
- Active nav item: `bg-white/20 text-white rounded-xl`
- Inactive: `text-white/60 hover:bg-white/10 hover:text-white rounded-xl`

**Header**: `relative z-10 h-14 backdrop-blur-xl bg-white/8 border-b border-white/15`
- User name: `text-white`, sub-info: `text-white/35`, sign out: `text-white/45 hover:text-white`

**Tab bars** (e.g. ShopLayout): Replace underline tabs with pill-style glass tabs
- Active: `bg-white/20 text-white backdrop-blur-md border border-white/20 rounded-lg`
- Inactive: `text-white/50 hover:text-white hover:bg-white/10 rounded-lg`

---

## Page Conventions

Apply these patterns consistently across all pages:

- **Page titles**: `text-2xl font-semibold text-white`
- **Section subtitles / meta text**: `text-white/40–50`
- **Lists inside GlassCard**: rows separated by `border-t border-white/8`, padding `px-5 py-4`
- **Error banners**: `GlassCard` with `!bg-red-500/15 !border-red-400/30`, text `text-red-300`
- **Loading states**: `text-white/50`
- **Empty states**: `text-white/35–40`
- **Forms**: wrap in `GlassCard className="p-6"`, use `GlassInput`/`GlassTextarea`/`GlassButton`
- **Navigation links styled as buttons**: use `glassButtonClass()` on `<Link>`, never wrap `<GlassButton>` in `<Link>`

---

## Design Rules

1. **No coloured blobs** — pure neutral palette only
2. **No solid backgrounds** on any panel — always `backdrop-blur-xl` + `bg-white/<opacity>`
3. **No blue/indigo/purple tints** — everything is white-on-dark
4. **`overflow-hidden` + `relative`** on the root viewport div to clip the background properly
5. **`backdrop-blur` requires a visually varied background** — the background image provides this depth
6. All text uses `text-white` or `text-white/<opacity>` — never `text-gray-*`
