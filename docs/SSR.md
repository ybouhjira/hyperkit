# Server-Side Rendering (SSR) Guide

This guide covers how to use HyperKit with Solid Start and other SSR frameworks.

## Overview

HyperKit's theming system works by setting CSS variables on the document root (`:root`) using JavaScript. The `ThemeProvider` component applies theme values as CSS variables via the `applyThemeToDOM()` function, which requires DOM access.

**Key points:**

- Theme CSS variables are set on `:root` via JavaScript
- `applyThemeToDOM()` requires browser DOM access (won't work server-side)
- Components reference CSS variables (e.g., `var(--sk-bg-primary)`)
- SSR requires injecting theme CSS variables during initial render to avoid hydration mismatches

## Solid Start Setup

### 1. Install HyperKit

```bash
npm install @ybouhjira/hyperkit
```

### 2. Import CSS

In your root component (typically `src/app.tsx`), import the HyperKit CSS:

```tsx
import '@ybouhjira/hyperkit/dist/index.css';
```

### 3. Wrap App with ThemeProvider

```tsx
import { ThemeProvider } from '@ybouhjira/hyperkit';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <FileRoutes />
      </Router>
    </ThemeProvider>
  );
}
```

At this point, your app will work, but there's a **hydration gap**: during SSR, theme CSS variables won't be set, causing a flash of unstyled content (FOUC) until the client-side JavaScript loads and `ThemeProvider` runs.

## CSS Variable Injection for SSR

To eliminate the hydration gap, inject theme CSS variables during SSR by generating a `<style>` tag with CSS variables.

### Understanding the Problem

The `applyThemeToDOM()` function requires `document.documentElement` (DOM access). During SSR:

- No DOM exists server-side
- `ThemeProvider`'s `onMount` doesn't run
- Components render with `var(--sk-*)` references but no values set
- Result: unstyled flash until client hydration

### Solution: Generate CSS Variables Server-Side

Create a helper function to generate CSS variable declarations from a theme config:

```tsx
import { ThemeConfig } from '@ybouhjira/hyperkit';
import { resolveThemeDefaults } from '@ybouhjira/hyperkit/src/theme/defaults';

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function generateThemeCSS(theme: ThemeConfig): string {
  const vars: string[] = [];

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars.push(`--sk-${camelToKebab(key)}: ${value};`);
  });

  // Fonts
  vars.push(`--sk-font-code: ${theme.fonts.code};`);
  vars.push(`--sk-font-ui: ${theme.fonts.ui};`);
  vars.push(`--sk-font-mono: ${theme.fonts.mono};`);

  // Radius
  vars.push(`--sk-radius-sm: ${theme.radius.sm};`);
  vars.push(`--sk-radius-md: ${theme.radius.md};`);
  vars.push(`--sk-radius-lg: ${theme.radius.lg};`);
  vars.push(`--sk-radius-xl: ${theme.radius.xl};`);

  // Shadows
  vars.push(`--sk-shadow-sm: ${theme.shadows.sm};`);
  vars.push(`--sk-shadow-md: ${theme.shadows.md};`);
  vars.push(`--sk-shadow-lg: ${theme.shadows.lg};`);
  vars.push(`--sk-shadow-xl: ${theme.shadows.xl};`);
  vars.push(`--sk-shadow-2xl: ${theme.shadows['2xl']};`);
  vars.push(`--sk-shadow-inner: ${theme.shadows.inner};`);

  // Font sizes (static values for SSR - adaptive sizing happens client-side)
  vars.push(`--sk-font-size-xs: 12px;`);
  vars.push(`--sk-font-size-sm: 13px;`);
  vars.push(`--sk-font-size-base: 14px;`);
  vars.push(`--sk-font-size-lg: 16px;`);
  vars.push(`--sk-font-size-xl: 18px;`);
  vars.push(`--sk-font-size-2xl: 24px;`);
  vars.push(`--sk-font-size-3xl: 30px;`);
  vars.push(`--sk-font-size-4xl: 36px;`);
  vars.push(`--sk-font-size-5xl: 48px;`);
  vars.push(`--sk-font-size-6xl: 60px;`);

  // Resolve defaults for new token groups
  const resolved = resolveThemeDefaults(theme);

  // Surfaces
  const surfaceEntries: [string, any][] = [
    ['base', resolved.surfaces.base],
    ['raised', resolved.surfaces.raised],
    ['overlay', resolved.surfaces.overlay],
    ['sunken', resolved.surfaces.sunken],
  ];
  for (const [name, surface] of surfaceEntries) {
    vars.push(`--sk-surface-${name}-bg: ${surface.background};`);
    if (surface.backdropFilter)
      vars.push(`--sk-surface-${name}-backdrop: ${surface.backdropFilter};`);
    if (surface.border) vars.push(`--sk-surface-${name}-border: ${surface.border};`);
    if (surface.shadow) vars.push(`--sk-surface-${name}-shadow: ${surface.shadow};`);
  }

  // States
  const stateEntries: [string, any][] = [
    ['hover', resolved.states.hover],
    ['pressed', resolved.states.pressed],
    ['selected', resolved.states.selected],
    ['focused', resolved.states.focused],
    ['disabled', resolved.states.disabled],
  ];
  if (resolved.states.dragging) {
    stateEntries.push(['dragging', resolved.states.dragging]);
  }
  for (const [name, state] of stateEntries) {
    if (!state) continue;
    if (state.background) vars.push(`--sk-state-${name}-bg: ${state.background};`);
    if (state.opacity !== undefined) vars.push(`--sk-state-${name}-opacity: ${state.opacity};`);
    if (state.scale !== undefined) vars.push(`--sk-state-${name}-scale: ${state.scale};`);
    if (state.borderColor) vars.push(`--sk-state-${name}-border: ${state.borderColor};`);
    if (state.shadow) vars.push(`--sk-state-${name}-shadow: ${state.shadow};`);
  }

  // Motion
  vars.push(`--sk-motion-instant: ${resolved.motion.durations.instant};`);
  vars.push(`--sk-motion-fast: ${resolved.motion.durations.fast};`);
  vars.push(`--sk-motion-normal: ${resolved.motion.durations.normal};`);
  vars.push(`--sk-motion-slow: ${resolved.motion.durations.slow};`);
  vars.push(`--sk-motion-emphasis: ${resolved.motion.durations.emphasis};`);
  vars.push(`--sk-ease-standard: ${resolved.motion.easings.standard};`);
  vars.push(`--sk-ease-decelerate: ${resolved.motion.easings.decelerate};`);
  vars.push(`--sk-ease-accelerate: ${resolved.motion.easings.accelerate};`);
  vars.push(`--sk-ease-spring: ${resolved.motion.easings.spring};`);

  // Focus Ring
  vars.push(`--sk-focus-width: ${resolved.focusRing.width};`);
  vars.push(`--sk-focus-offset: ${resolved.focusRing.offset};`);
  vars.push(`--sk-focus-color: ${resolved.focusRing.color};`);
  vars.push(
    `--sk-focus-style: ${resolved.focusRing.style === 'glow' ? 'solid' : resolved.focusRing.style};`
  );
  if (resolved.focusRing.style === 'glow' && resolved.focusRing.glowSpread) {
    vars.push(`--sk-focus-glow-spread: ${resolved.focusRing.glowSpread};`);
    vars.push(
      `--sk-focus-glow-color: ${resolved.focusRing.glowColor ?? resolved.focusRing.color};`
    );
  }

  // Scrollbar
  vars.push(`--sk-scroll-width: ${resolved.scrollbar.width};`);
  vars.push(`--sk-scroll-thumb: ${resolved.scrollbar.thumbColor};`);
  vars.push(`--sk-scroll-thumb-hover: ${resolved.scrollbar.thumbHoverColor};`);
  vars.push(`--sk-scroll-track: ${resolved.scrollbar.trackColor};`);
  vars.push(`--sk-scroll-thumb-radius: ${resolved.scrollbar.thumbRadius};`);

  // Typography
  vars.push(`--sk-font-weight-regular: ${resolved.typography.fontWeights.regular};`);
  vars.push(`--sk-font-weight-medium: ${resolved.typography.fontWeights.medium};`);
  vars.push(`--sk-font-weight-semibold: ${resolved.typography.fontWeights.semibold};`);
  vars.push(`--sk-font-weight-bold: ${resolved.typography.fontWeights.bold};`);
  vars.push(`--sk-font-weight-extrabold: ${resolved.typography.fontWeights.extrabold};`);
  vars.push(`--sk-font-weight-black: ${resolved.typography.fontWeights.black};`);
  vars.push(`--sk-letter-spacing-tight: ${resolved.typography.letterSpacing.tight};`);
  vars.push(`--sk-letter-spacing-normal: ${resolved.typography.letterSpacing.normal};`);
  vars.push(`--sk-letter-spacing-wide: ${resolved.typography.letterSpacing.wide};`);
  vars.push(`--sk-line-height-tight: ${resolved.typography.lineHeights.tight};`);
  vars.push(`--sk-line-height-normal: ${resolved.typography.lineHeights.normal};`);
  vars.push(`--sk-line-height-relaxed: ${resolved.typography.lineHeights.relaxed};`);

  // Density
  vars.push(`--sk-density-item-sm: ${resolved.density.itemHeight.sm};`);
  vars.push(`--sk-density-item-md: ${resolved.density.itemHeight.md};`);
  vars.push(`--sk-density-item-lg: ${resolved.density.itemHeight.lg};`);
  vars.push(`--sk-density-pad-x: ${resolved.density.cellPadding.x};`);
  vars.push(`--sk-density-pad-y: ${resolved.density.cellPadding.y};`);
  vars.push(`--sk-density-gap-sm: ${resolved.density.gap.sm};`);
  vars.push(`--sk-density-gap-md: ${resolved.density.gap.md};`);
  vars.push(`--sk-density-gap-lg: ${resolved.density.gap.lg};`);

  // Spacing
  for (const [key, value] of Object.entries(resolved.spacing)) {
    vars.push(`--sk-space-${key}: ${value};`);
  }

  // Z-Index
  for (const [key, value] of Object.entries(resolved.zIndex)) {
    vars.push(`--sk-z-${key}: ${value};`);
  }

  // Component Overrides
  const setCompVars = (prefix: string, obj: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v != null && v !== '') {
        vars.push(`--sk-comp-${prefix}-${camelToKebab(k)}: ${v};`);
      }
    }
  };
  if (resolved.components.toolbar)
    setCompVars('toolbar', resolved.components.toolbar as Record<string, unknown>);
  if (resolved.components.listItem)
    setCompVars('list-item', resolved.components.listItem as Record<string, unknown>);
  if (resolved.components.button)
    setCompVars('button', resolved.components.button as Record<string, unknown>);
  if (resolved.components.input)
    setCompVars('input', resolved.components.input as Record<string, unknown>);
  if (resolved.components.card)
    setCompVars('card', resolved.components.card as Record<string, unknown>);

  // Custom Properties
  for (const [key, value] of Object.entries(resolved.customProperties)) {
    vars.push(`--sk-custom-${camelToKebab(key)}: ${value};`);
  }

  return `:root { ${vars.join(' ')} }`;
}
```

### Inject CSS in HTML Head

In your `src/entry-server.tsx`:

```tsx
import { StartServer, createHandler } from '@solidjs/start/server';
import { themePresets } from '@ybouhjira/hyperkit/src/theme/presets';
import { generateThemeCSS } from './utils/theme-ssr';

export default createHandler(() => {
  const defaultTheme = themePresets['zed-dark']; // or any other preset
  const themeCSS = generateThemeCSS(defaultTheme);

  return (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
            {assets}
            {/* Inject theme CSS variables for SSR */}
            <style>{themeCSS}</style>
          </head>
          <body>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});
```

Now the CSS variables are available during SSR, eliminating the unstyled flash.

## Hydration Tips

### 1. Use CSS Variables for Theme-Dependent Styling

Always reference CSS variables, not JavaScript theme state:

```tsx
// ✅ Good - works during SSR
<div style={{ background: 'var(--sk-bg-primary)' }}>...</div>;

// ❌ Bad - undefined during SSR
const { theme } = useThemeContext();
<div style={{ background: theme().colors.bgPrimary }}>...</div>;
```

### 2. Avoid Conditional Rendering Based on Theme

Don't conditionally render based on theme state during SSR:

```tsx
// ❌ Bad - causes hydration mismatch
const { theme } = useThemeContext();
return theme().id === 'dark' ? <DarkUI /> : <LightUI />;

// ✅ Good - use CSS and data attributes
<div data-theme={theme().id} class="themed-ui">
  ...
</div>;
```

### 3. Client-Side Theme Switching

Theme switching only works client-side. Use `createEffect` to update theme after hydration:

```tsx
import { createSignal, onMount } from 'solid-js';
import { useThemeContext } from '@ybouhjira/hyperkit';

function ThemeSwitcher() {
  const { setTheme, themes } = useThemeContext();
  const [mounted, setMounted] = createSignal(false);

  onMount(() => setMounted(true));

  return (
    <Show when={mounted()}>
      <select onChange={(e) => setTheme(e.currentTarget.value)}>
        <For each={themes}>{(theme) => <option value={theme.id}>{theme.name}</option>}</For>
      </select>
    </Show>
  );
}
```

## Known Limitations

### 1. Theme Switching Server-Side

Theme switching requires client-side JavaScript. You can't switch themes during SSR.

**Workaround**: Inject a default theme during SSR, allow switching client-side.

### 2. `applyThemeToDOM()` Won't Run Server-Side

The `applyThemeToDOM()` function requires `document.documentElement`. During SSR, you must generate CSS manually (as shown above).

### 3. Adaptive Font Sizes

The adaptive font sizing feature uses `window.innerWidth` to compute responsive font sizes. During SSR, `window` is undefined.

**Solution**: The `generateThemeCSS()` helper uses static font sizes (14px base) for SSR. Client-side hydration will apply adaptive sizing.

### 4. Hydration Gap

There's a brief moment between SSR and hydration where:

- CSS variables are set (from SSR-injected `<style>` tag)
- `ThemeProvider` hasn't mounted yet
- Theme switching won't work until hydration completes

**Impact**: Minimal - the UI renders correctly, theme switching just isn't available until after hydration.

## Full Example

See the [Solid Start example](../examples/solid-start/) for a complete working implementation.

## Troubleshooting

### FOUC (Flash of Unstyled Content)

If you see unstyled content briefly:

1. Ensure you're injecting theme CSS in `entry-server.tsx`
2. Verify the `<style>` tag appears in the SSR HTML output
3. Check browser DevTools to confirm CSS variables are set on `:root`

### Hydration Mismatch Warnings

If you see hydration warnings:

1. Don't conditionally render based on `useThemeContext()` state during SSR
2. Use CSS variables (`var(--sk-*)`) instead of JS theme values
3. Ensure the same theme is used for both SSR and initial client render

### Theme Not Loading

If the theme doesn't apply:

1. Verify `@ybouhjira/hyperkit/dist/index.css` is imported
2. Check that `ThemeProvider` wraps your app
3. Confirm CSS variables are set (inspect `:root` in DevTools)
4. Ensure no CSS specificity conflicts override theme variables
