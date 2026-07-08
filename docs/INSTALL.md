# Installing HyperKit

HyperKit is published to the public npm registry.

```bash
npm install @ybouhjira/hyperkit
# or
pnpm add @ybouhjira/hyperkit
```

## Peer dependencies

```bash
npm install solid-js @kobalte/core effect
```

## Styles

Import the stylesheet once, at your app entry:

```tsx
import '@ybouhjira/hyperkit/dist/index.css';
```

## Optional packages

| Package | Install |
| --- | --- |
| Diagrams (SolidJS) | `npm install @ybouhjira/diagram-solid @ybouhjira/diagram-core` |
| Diagrams (vanilla SVG) | `npm install @ybouhjira/diagram-svg @ybouhjira/diagram-core` |
| Schema-driven views | `npm install @ybouhjira/hyperkit-views` |
| ESLint rules | `npm install -D @ybouhjira/eslint-plugin-hyperkit` |

## Update

```bash
npm install @ybouhjira/hyperkit@latest
```

For SSR setup (SolidStart), see [SSR.md](SSR.md).
