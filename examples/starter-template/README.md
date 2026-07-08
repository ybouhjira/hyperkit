# HyperKit Starter Template

A minimal Vite + SolidJS starter template showcasing HyperKit components.

## Features

- **ThemeProvider** with preset themes and live theme switching
- **Core Components**: Card, Button, Input, Text, Box, Flex
- **Type-safe** TypeScript setup
- **Hot Module Replacement** for fast development

## Getting Started

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## What's Included

- **App.tsx**: Main application with theme switching and component demos
- **index.tsx**: Entry point with HyperKit CSS import
- **index.css**: Minimal reset styles

## Learn More

- [SolidJS Documentation](https://www.solidjs.com/)
- [HyperKit Repository](https://github.com/ybouhjira/hyperkit)
- [Vite Documentation](https://vitejs.dev/)

## Customization

HyperKit uses CSS variables for theming. You can customize any component by overriding CSS variables:

```css
:root {
  --sk-color-primary: #your-color;
  --sk-spacing-md: 16px;
}
```

See the [CSS Variables documentation](../../docs/CSS_VARIABLES.md) for a complete reference.
