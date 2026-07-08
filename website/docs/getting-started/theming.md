---
sidebar_position: 3
---

# Theming

Customize the appearance of HyperKit components using the powerful theme system.

## ThemeProvider Setup

The `ThemeProvider` component sets up CSS custom properties for your entire app:

```tsx
import { ThemeProvider } from '@ybouhjira/hyperkit';

function App() {
  return <ThemeProvider>{/* Your app content */}</ThemeProvider>;
}
```

## CSS Custom Properties

All HyperKit components use CSS custom properties (CSS variables) with the `--sk-*` prefix:

- `--sk-color-primary-*` - Primary color scale
- `--sk-color-neutral-*` - Neutral color scale
- `--sk-space-*` - Spacing tokens
- `--sk-font-size-*` - Typography scale
- `--sk-radius-*` - Border radius values

## Custom Properties

You can define custom CSS variables via the `customProperties` prop:

```tsx
<ThemeProvider
  customProperties={{
    brandColor: '#FF6B6B',
    headerHeight: '64px',
  }}
>
  {/* Your app */}
</ThemeProvider>
```

These become CSS variables with the `--sk-custom-*` prefix:

```css
/* Available as: */
--sk-custom-brand-color: #ff6b6b;
--sk-custom-header-height: 64px;
```

## Overriding Theme Values

Override default theme values by passing a custom theme config:

```tsx
import { ThemeProvider, type ThemeConfig } from '@ybouhjira/hyperkit';

const customTheme: Partial<ThemeConfig> = {
  colors: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3',
      900: '#0d47a1',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};

<ThemeProvider theme={customTheme}>{/* Your app */}</ThemeProvider>;
```

## CSS Variable Scoping

Override variables at any scope level without `!important`:

```css
/* Global override */
:root {
  --sk-color-primary-500: #ff6b6b;
}

/* Component-specific override */
.my-card {
  --sk-space-md: 24px;
}
```

## Dark Mode

HyperKit respects the system color mode preference. Components automatically adjust using CSS custom properties.

## Next Steps

- Deep-dive into the [Theme System](../systems/theme.md)
- Read the [CSS Variables guide](../guides/css-variables.md) for component-specific theming options
