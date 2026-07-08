# HyperKit + Solid Start SSR Example

This example demonstrates how to use HyperKit with Solid Start for server-side rendering (SSR).

## Features

- Server-side rendering with theme CSS variables injected during SSR
- No FOUC (Flash of Unstyled Content) on initial load
- Client-side theme switching after hydration
- All HyperKit components work seamlessly with SSR

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 3. Build for Production

```bash
npm run build
npm start
```

## How It Works

### Theme CSS Variable Injection

The key to SSR support is injecting theme CSS variables during server-side rendering:

1. **`src/utils/theme-ssr.ts`** - Contains `generateThemeCSS()` helper that converts a theme config to CSS variable declarations
2. **`src/entry-server.tsx`** - Injects the theme CSS into the HTML `<head>` during SSR
3. **`src/app.tsx`** - Wraps the app with `ThemeProvider` (runs client-side)

This approach ensures:

- CSS variables are available during SSR (no unstyled flash)
- Theme switching works after client-side hydration
- No hydration mismatches

### Component Usage

All HyperKit components work with SSR:

```tsx
import { Box, Button, Card, Input, Text } from '@ybouhjira/hyperkit';

<Card padding="lg">
  <Text size="xl">Hello SSR!</Text>
  <Input placeholder="Type something..." />
  <Button variant="primary">Click Me</Button>
</Card>;
```

### Theme Switching

Theme switching requires client-side JavaScript, so we use `onMount()` to only render the theme switcher after hydration:

```tsx
import { createSignal, onMount, Show } from 'solid-js';
import { useThemeContext } from '@ybouhjira/hyperkit';

const { setTheme, themes } = useThemeContext();
const [mounted, setMounted] = createSignal(false);

onMount(() => setMounted(true));

<Show when={mounted()}>
  <select onChange={(e) => setTheme(e.currentTarget.value)}>
    <For each={themes}>{(theme) => <option value={theme.id}>{theme.name}</option>}</For>
  </select>
</Show>;
```

## Project Structure

```
src/
├── app.tsx              # Root component with ThemeProvider
├── entry-server.tsx     # SSR entry - injects theme CSS
├── entry-client.tsx     # Client entry - hydration
├── routes/
│   └── index.tsx        # Demo page
└── utils/
    └── theme-ssr.ts     # Theme CSS generation helper
```

## Learn More

- [HyperKit Documentation](../../README.md)
- [SSR Guide](../../docs/SSR.md)
- [Solid Start Documentation](https://start.solidjs.com)

## License

MIT
