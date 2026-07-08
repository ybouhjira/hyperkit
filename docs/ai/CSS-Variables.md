# CSS Variables Quick Reference

Quick lookup for customizing HyperKit components via CSS variables.

## Usage Pattern

```tsx
// Global override in ThemeProvider
<ThemeProvider theme={{ customProperties: { cardBg: '#1a1a1a' } }} />
// Creates: --sk-custom-card-bg

// Component-level override
<Button style={{ '--sk-btn-radius': '12px' }} />

// CSS file override
.my-custom-card {
  --sk-card-radius: 16px;
  --sk-card-bg: rgba(255, 255, 255, 0.05);
}
```

## Most Commonly Customized Variables

### Button

- `--sk-btn-radius` - Border radius (default: `var(--sk-radius-md)`)
- `--sk-btn-primary-bg` - Primary background (default: `var(--sk-accent)`)
- `--sk-btn-primary-hover-bg` - Primary hover (default: `var(--sk-accent-hover)`)
- `--sk-btn-{size}-padding-x/y` - Size-specific padding

### Card

- `--sk-card-radius` - Border radius (default: `var(--sk-radius-lg)`)
- `--sk-card-bg` - Background color (default: `var(--sk-bg-secondary)`)
- `--sk-card-shadow-elevated` - Elevated shadow (default: `0 2px 8px rgb(0 0 0 / 0.1)`)
- `--sk-card-padding-{size}` - Padding variants (none/sm/md/lg)

### Input

- `--sk-input-radius` - Uses global `--sk-radius-md`
- `--sk-input-focus-shadow` - Uses `var(--sk-accent)` for focus ring

### Dialog

- `--sk-z-modal` - Z-index for modals (from theme)
- Content max-width: 32rem (hardcoded, override via class)

### Tooltip

- `--sk-z-tooltip` - Z-index for tooltips (from theme)

### Toast

- `--sk-z-toast` - Z-index for toasts (from theme)
- `--sk-toast-max-w` - Max width (default: `420px`)
- `--sk-toast-progress-h` - Progress bar height (default: `3px`)

### Select & Dropdown

- `--sk-z-popover` - Z-index for dropdowns (from theme)

### Code Block

- `--sk-custom-code-keyword` - Syntax keyword color (default: `#c678dd`)
- `--sk-custom-code-string` - Syntax string color (default: `#98c379`)
- `--sk-custom-code-number` - Syntax number color (default: `#d19a66`)
- `--sk-custom-code-function` - Syntax function color (default: `#61afef`)

### Slider

- `--sk-slider-track-bg` - Track background (default: `var(--sk-bg-tertiary)`)
- `--sk-slider-fill-bg` - Fill color (default: `var(--sk-accent)`)
- `--sk-slider-thumb-size` - Thumb size (default: `18px`)

### Switch

- `--sk-switch-track-bg` - Unchecked track (default: `var(--sk-bg-tertiary)`)
- `--sk-switch-track-bg-checked` - Checked track (default: `var(--sk-accent)`)

### Spinner

- `--sk-spinner-color` - Spinner color (default: `var(--sk-accent)`)
- `--sk-spinner-border-width` - Border thickness (default: `2px`)

### Separator

- `--sk-separator-size` - Thickness (default: `1px`)
- `--sk-separator-color` - Color (default: `var(--sk-border)`)
- `--sk-separator-margin` - Spacing around separator

### Accordion

- `--sk-accordion-trigger-padding` - Trigger padding (default: `var(--sk-space-md)`)
- `--sk-accordion-trigger-hover-bg` - Hover background (default: `var(--sk-bg-secondary)`)

### Collapsible

- `--sk-collapsible-trigger-radius` - Trigger border radius
- `--sk-collapsible-chevron-size` - Chevron icon size

## Design Tokens (Global)

### Component Heights

- `--sk-height-xs` - `24px`
- `--sk-height-sm` - `28px`
- `--sk-height-md` - `32px`
- `--sk-height-lg` - `40px`
- `--sk-height-xl` - `48px`

### Transition Durations

- `--sk-duration-instant` - `50ms`
- `--sk-duration-fast` - `150ms`
- `--sk-duration-normal` - `200ms`
- `--sk-duration-slow` - `300ms`

### Easing Functions

- `--sk-ease-default` - `cubic-bezier(0.4, 0, 0.2, 1)`
- `--sk-ease-bounce` - `cubic-bezier(0.34, 1.56, 0.64, 1)`

### Icon Sizes

- `--sk-icon-xs` - `12px`
- `--sk-icon-sm` - `14px`
- `--sk-icon-md` - `16px`
- `--sk-icon-lg` - `20px`
- `--sk-icon-xl` - `24px`

### Line Heights

- `--sk-leading-tight` - `1.25`
- `--sk-leading-normal` - `1.5`
- `--sk-leading-relaxed` - `1.75`

### Scrollbar

- `--sk-scroll-width` - `10px`
- `--sk-scroll-thumb` - `var(--sk-border)`
- `--sk-scroll-thumb-radius` - `5px`

## Theme Reference Variables

These are set by ThemeProvider and referenced by components:

### Colors

- `--sk-accent` / `--sk-accent-hover` / `--sk-accent-muted`
- `--sk-bg-primary` / `--sk-bg-secondary` / `--sk-bg-tertiary`
- `--sk-text-primary` / `--sk-text-secondary` / `--sk-text-muted`
- `--sk-border` / `--sk-border-subtle`
- `--sk-success` / `--sk-error` / `--sk-warning` / `--sk-info`

### Spacing

- `--sk-space-xs` / `--sk-space-sm` / `--sk-space-md` / `--sk-space-lg`

### Border Radius

- `--sk-radius-sm` / `--sk-radius-md` / `--sk-radius-lg`

### Typography

- `--sk-font-ui` / `--sk-font-mono`
- `--sk-font-size-xs` / `--sk-font-size-sm` / `--sk-font-size-base` / `--sk-font-size-lg`

### Shadows

- `--sk-shadow-sm` / `--sk-shadow-md` / `--sk-shadow-lg` / `--sk-shadow-2xl`

### Z-Index

- `--sk-z-popover` (dropdowns, selects)
- `--sk-z-modal` (dialogs)
- `--sk-z-tooltip` (tooltips)
- `--sk-z-toast` (toasts)

## Class Naming Convention

- Block: `.sk-{component}`
- Element: `.sk-{component}__{element}`
- Modifier: `.sk-{component}--{modifier}`
- State: `[data-state]` attributes

## Full Documentation

See `/docs/CSS_VARIABLES.md` for complete reference with all variables and examples.
