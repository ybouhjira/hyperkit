# Theme System

> Centralized theming with CSS variables, presets, and customization

## Components

- **ThemeProvider** — Root provider that applies theme CSS variables
- **ThemePicker** — UI component for selecting themes
- **FontSelect** — Font family selector component
- **themePresets** — Built-in theme configurations

## ThemeConfig Interface

```typescript
interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  radius: ThemeRadius;
  fontSizes: ThemeFontSizes;
  shadows: ThemeShadows;
  platform?: 'macos' | 'windows' | 'ubuntu' | 'material';
  surfaces?: ThemeSurfaces;
  states?: ThemeStates;
  motion?: ThemeMotion;
  focusRing?: ThemeFocusRing;
  scrollbar?: ThemeScrollbar;
  typography?: ThemeTypography;
  density?: ThemeDensity;
  spacing?: ThemeSpacing;
  zIndex?: ThemeZIndex;
  components?: ThemeComponents;
  customProperties?: Record<string, string>;
}
```

## ThemeProvider

### Props

| Prop       | Type          | Default      | Description                |
| ---------- | ------------- | ------------ | -------------------------- |
| `theme`    | `ThemeConfig` | **required** | Theme configuration object |
| `children` | `JSX.Element` | **required** | App content                |

### Example

```tsx
import { ThemeProvider } from '@ybouhjira/hyperkit';
import { defaultTheme } from '@ybouhjira/hyperkit/theme/presets';

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

## Custom Properties

Custom properties in `ThemeConfig.customProperties` become CSS variables with `--sk-custom-` prefix:

```typescript
const customTheme: ThemeConfig = {
  // ... other theme properties
  customProperties: {
    'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    heroHeight: '600px',
  },
};
```

**Generated CSS variables:**

- `--sk-custom-gradient-primary`
- `--sk-custom-hero-height`

**Usage:**

```tsx
<Box background="var(--sk-custom-gradient-primary)" h="var(--sk-custom-hero-height)">
  Hero Section
</Box>
```

## Built-in Presets

```tsx
import {
  defaultTheme,
  darkTheme,
  lightTheme,
  macosTheme,
  windowsTheme,
} from '@ybouhjira/hyperkit/theme/presets';
```

## Creating Custom Themes

```tsx
import { ThemeConfig } from '@ybouhjira/hyperkit';

const myTheme: ThemeConfig = {
  id: 'my-theme',
  name: 'My Custom Theme',
  colors: {
    bg: {
      primary: '#ffffff',
      secondary: '#f7f7f7',
      tertiary: '#efefef',
      elevated: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#6b6b6b',
      muted: '#9b9b9b',
    },
    accent: '#3b82f6',
    // ... more colors
  },
  fonts: {
    ui: 'Inter, system-ui, sans-serif',
    mono: 'Fira Code, monospace',
  },
  // ... other properties
};
```

## Gotchas

- **Must wrap app root**: ThemeProvider must be at the root of your app to work correctly
- **CSS variables on :root**: Theme applies CSS variables to `:root`, making them globally available
- **customProperties prefix**: Custom properties get `--sk-custom-` prefix automatically
- **Hot theme switching**: Changing the `theme` prop updates all CSS variables in real-time

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
