---
title: Theme System
sidebar_position: 5
description: ThemeProvider, presets, sounds, effects, and CSS variable injection.
---

# Theme System

Every HyperKit component reads its visual values from `--sk-*` CSS custom properties. `ThemeProvider` sets those variables on `:root` from a typed `ThemeConfig` — change the config and the whole app restyles, with no prop drilling.

For an introduction, start with [Theming](../getting-started/theming.md). This page covers the full system surface.

## API

| Export           | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `ThemeProvider`  | Sets `--sk-*` CSS vars on `:root`                       |
| `ThemePicker`    | Inline theme switcher UI                                |
| `FontSelect`     | Font family selector                                    |
| `useTheme`       | Access and update the current theme (`UseThemeReturn`)  |
| `useThemeSounds` | Theme-driven sound design (Web Audio, opt-in)           |
| `playTone`       | Synthesize a single tone from a `ThemeSoundPreset`      |
| `playUrl`        | Load and play a URL sample (volume-clamped)             |
| `themePresets`   | All built-in theme presets                              |

Types: `ThemeConfig`, `ThemeColors`, `ThemeFonts`, `ThemeRadius`, `ThemeSounds`, `ThemeSoundPreset`, `ThemeEffects`, `UseThemeSoundsReturn`, `ThemeSoundEventName`.

## Built-in Themes

`defaultLightTheme`, `galleryHubDarkTheme`, `reportDarkTheme`, `highContrastTheme`, `warmDarkTheme`, `oceanTheme`, `roseTheme`, `devtoolsTheme`, `productivityBlueTheme`, `neonStudioTheme`, and `hyperlabsTheme` — a fully specified premium preset with a locked type scale (10–24px), 4/8-based spacing, visible dark-mode borders, and spring motion curves.

```tsx
import { ThemeProvider, hyperlabsTheme } from '@ybouhjira/hyperkit';

<ThemeProvider theme={hyperlabsTheme}>
  <App />
</ThemeProvider>
```

## Custom Themes

```tsx
import { ThemeProvider } from '@ybouhjira/hyperkit';

<ThemeProvider
  theme={{
    colors: {
      bg: '#1a1a2e',
      fg: '#eaeaea',
      accent: '#e94560',
    },
    fonts: { body: 'Inter', mono: 'JetBrains Mono' },
    radius: { sm: '4px', md: '8px', lg: '12px' },
    customProperties: {
      'header-height': '60px', // becomes --sk-custom-header-height
    },
  }}
>
  <App />
</ThemeProvider>
```

`customProperties` entries are emitted as `--sk-custom-{key}` variables. The HyperKit CLI (`npx hyperkit theme generate`) can generate type-safe declarations for them.

## Reading and Switching Themes

```tsx
import { useTheme, themePresets } from '@ybouhjira/hyperkit';

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <select onChange={(e) => setTheme(themePresets[Number(e.currentTarget.value)])}>
      {/* ... */}
    </select>
  );
}
```

## Theme Sounds

Themes can define a `sounds` block (master volume, enabled flag, per-event presets for `hover`, `click`, `select`, `confirm`, `success`, `error`, `notify`, `pop`, `toggleOn`, `toggleOff`). Sounds are synthesized with Web Audio — no assets to ship — and are double-opt-in: both the theme and the user setting must enable them.

```tsx
import { useThemeSounds } from '@ybouhjira/hyperkit';

const sounds = useThemeSounds();
<button onClick={() => sounds.play('click')}>Save</button>;

sounds.setEnabled(true); // user opt-in, persisted to localStorage
sounds.setVolume(0.5);   // 0..1
```

Unknown event names are silent, and the hook is SSR-safe.

## Theme Effects

The optional `effects` block toggles visual polish per theme: `hover` (`'glow' | 'scale'`), `press` (`'scale' | 'ripple'`), `selection` (`'lift' | 'outline' | 'glow'`), `pulse` (`'soft' | 'heavy'`), and `overlayBlur`.

## SSR

Theme variables are injected client-side by default. For flicker-free server rendering, see the [SSR guide](../guides/ssr.md#css-variable-injection-for-ssr).
