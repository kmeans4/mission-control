# Mission Control Theming System

A comprehensive theming system for Mission Control supporting dark/light modes and customizable accent colors.

## Features

- ✅ **Dark Mode (Default)** - Deep dark backgrounds (#0a0a0f, #12121a) with proper contrast
- ✅ **Light Mode** - Clean light theme with subtle grays
- ✅ **4 Accent Colors** - Purple, Blue, Green, Orange
- ✅ **localStorage Persistence** - User preferences saved as 'mission-control-theme'
- ✅ **Smooth Transitions** - 300ms ease transitions for all color changes
- ✅ **System Preference Detection** - Respects `prefers-color-scheme` on first visit
- ✅ **No-Flash Script** - Theme applied before React hydration to prevent flicker

## File Structure

```
mission-control/
├── styles/
│   └── themes.css          # CSS custom properties
├── hooks/
│   └── useTheme.js         # React hook for theme management
├── components/
│   └── ThemeSwitcher.jsx   # UI component for theme controls
├── app/
│   └── layout.tsx          # Root layout with theme provider
└── THEMING_README.md       # This documentation
```

## Quick Start

### 1. Import the ThemeProvider

The `layout.tsx` file already wraps the application with `ThemeProvider`.

### 2. Use the Theme Hook

```jsx
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const { 
    mode,           // 'dark' | 'light'
    accent,         // 'purple' | 'blue' | 'green' | 'orange'
    isDark,         // boolean
    isLight,        // boolean
    toggleMode,     // () => void - toggle between dark/light
    setMode,        // (mode: 'dark' | 'light') => void
    setAccent,      // (accent: string) => void
    resetTheme      // () => void - reset to defaults
  } = useTheme();

  return (
    <div>
      Current mode: {mode}
      <button onClick={toggleMode}>Toggle Theme</button>
    </div>
  );
}
```

### 3. Add the Theme Switcher UI

```jsx
import { ThemeSwitcher, ModeToggle, AccentPicker } from '../components/ThemeSwitcher';

// Full controls
<ThemeSwitcher showModeToggle showAccentPicker />

// Just the mode toggle button
<ModeToggle />

// Just the accent color picker
<AccentPicker />
```

## CSS Custom Properties

All theme values are available as CSS custom properties:

### Background Colors
- `--bg-primary` - Main background
- `--bg-secondary` - Card/panel backgrounds
- `--bg-tertiary` - Input/secondary backgrounds
- `--bg-elevated` - Elevated surfaces
- `--bg-overlay` - Modal/backdrop overlays

### Text Colors
- `--text-primary` - Primary text
- `--text-secondary` - Secondary text
- `--text-tertiary` - Muted text
- `--text-muted` - Very muted text
- `--text-inverse` - Text on accent backgrounds

### Accent Colors
- `--accent` - Current accent color (changes with selection)
- `--accent-light` - Lightened accent
- `--accent-dark` - Darkened accent
- `--accent-subtle` - Semi-transparent accent
- `--accent-hover` - Hover state accent

### Borders
- `--border-subtle` - Very subtle borders
- `--border-default` - Standard borders
- `--border-strong` - Emphasized borders

### Semantic Colors
- `--success` - Green (#22c55e)
- `--warning` - Amber (#f59e0b)
- `--error` - Red (#ef4444)
- `--info` - Blue (#3b82f6)

### Shadows
- `--shadow-sm` - Small shadows
- `--shadow-md` - Medium shadows
- `--shadow-lg` - Large shadows
- `--shadow-glow` - Accent-colored glow

### Transitions
- `--transition-fast` - 150ms
- `--transition-base` - 300ms (default)
- `--transition-slow` - 500ms

### Border Radius
- `--radius-sm` - 4px
- `--radius-md` - 8px
- `--radius-lg` - 12px
- `--radius-xl` - 16px
- `--radius-full` - 9999px (pills)

## Usage Examples

### Using CSS Variables

```css
.my-component {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.my-button {
  background-color: var(--accent);
  color: var(--text-inverse);
  transition: all var(--transition-base);
}

.my-button:hover {
  background-color: var(--accent-hover);
  box-shadow: var(--shadow-glow);
}
```

### Using Utility Classes

```jsx
<div className="bg-secondary text-primary">
  <span className="text-accent">Highlighted</span>
</div>
```

Available utility classes:
- `.bg-primary`, `.bg-secondary`, `.bg-tertiary`, `.bg-elevated`
- `.text-primary`, `.text-secondary`, `.text-tertiary`, `.text-muted`, `.text-accent`
- `.border-subtle`, `.border-default`, `.border-strong`
- `.accent-bg`, `.accent-text`, `.accent-border`

## Accent Color Options

| Name   | Value   | CSS Variable       |
|--------|---------|-------------------|
| Purple | #8b5cf6 | --accent-purple   |
| Blue   | #3b82f6 | --accent-blue     |
| Green  | #22c55e | --accent-green    |
| Orange | #f97316 | --accent-orange   |

## localStorage Schema

Theme preferences are stored in localStorage under the key `mission-control-theme`:

```json
{
  "mode": "dark",
  "accent": "purple"
}
```

## No-Flash Script

The no-flash script runs immediately on page load (before React hydration) to:
1. Read theme from localStorage or detect system preference
2. Apply theme classes to `<html>` element
3. Prevent the "white flash" when dark mode is preferred

This is included in `layout.tsx` via an inline script.

## System Preference Detection

On first visit (when no localStorage preference exists), the theme defaults to:
- Dark mode if `prefers-color-scheme: dark`
- Light mode if `prefers-color-scheme: light`
- Dark mode as ultimate fallback

## Accessibility

- Respects `prefers-reduced-motion` - disables transitions for users who prefer reduced motion
- High contrast support - dark and light modes designed for WCAG compliance
- Focus states - all interactive elements have visible focus indicators
- ARIA labels - screen reader friendly labels for all controls

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- All modern browsers with CSS custom properties support

## Customization

### Adding New Accent Colors

1. Add color to `styles/themes.css`:
```css
:root {
  --accent-pink: #ec4899;
}

[data-accent="pink"] {
  --accent: var(--accent-pink);
}
```

2. Update `hooks/useTheme.js`:
```javascript
export const ACCENT_COLORS = {
  // ... existing colors
  pink: { name: 'Pink', value: '#ec4899', class: 'accent-pink' }
};
```

### Custom Transitions

Override CSS variables in your component:
```css
.my-custom-transition {
  transition: all var(--transition-slow);
}
```

Or disable transitions entirely:
```css
* {
  transition: none !important;
}
```

## Troubleshooting

### Flash of Wrong Theme
- Ensure the no-flash script in `layout.tsx` is not removed
- Check that localStorage is accessible (no privacy mode blocking)

### Theme Not Persisting
- Verify localStorage is enabled in browser settings
- Check for JavaScript errors in console

### Hydration Mismatch
- Use `suppressHydrationWarning` on `<html>` and `<body>` tags
- Check for server/client rendering differences

### Accent Color Not Applying
- Ensure `data-accent` attribute is set on `<html>` element
- Check CSS custom property syntax
