# Installing HyperKit

HyperKit is published to the public npm registry.

```bash
npm install @ybouhjira/hyperkit
# or
pnpm add @ybouhjira/hyperkit
```

## Peer dependencies

`solid-js` and `effect` are peer dependencies; npm ≥7 and pnpm install them automatically. They are peers (not bundled) because both must be single-instance across your app — HyperKit shares Solid's reactivity graph and Effect's service tags with your code.

```bash
# only needed on yarn or npm <7
npm install solid-js effect
```

## Styles

Import the stylesheet once, at your app entry:

```tsx
import '@ybouhjira/hyperkit/dist/index.css';
```

## Optional packages

| Package                | Install                                                        |
| ---------------------- | -------------------------------------------------------------- |
| Diagrams (SolidJS)     | `npm install @ybouhjira/diagram-solid @ybouhjira/diagram-core` |
| Diagrams (vanilla SVG) | `npm install @ybouhjira/diagram-svg @ybouhjira/diagram-core`   |
| Schema-driven views    | `npm install @ybouhjira/hyperkit-views`                        |
| ESLint rules           | `npm install -D @ybouhjira/eslint-plugin-hyperkit`             |

## Update

```bash
npm install @ybouhjira/hyperkit@latest
```

For SSR setup (SolidStart), see [SSR.md](SSR.md).
