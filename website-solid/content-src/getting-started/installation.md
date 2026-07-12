---
sidebar_position: 1
---

# Installation

Install HyperKit:

```bash
npm install @ybouhjira/hyperkit
```

## Peer Dependencies

npm ≥7 and pnpm install these automatically. They are peer dependencies (not bundled) because both must be **single-instance** across your app — HyperKit shares Solid's reactivity graph and Effect's service tags with your code, and a duplicated copy of either breaks context identity.

| Package    | Version | Purpose            |
| ---------- | ------- | ------------------ |
| `solid-js` | ^1.8.0  | SolidJS framework  |
| `effect`   | ^3.0.0  | Functional effects |

Accessibility primitives (`@kobalte/core`) and typography helpers ship as regular dependencies — you never install or import them yourself.

## CSS Import

Import the HyperKit stylesheet in your app entry point:

```typescript
import '@ybouhjira/hyperkit/dist/index.css';
```

## Verify Installation

Create a simple test component to verify the installation:

```tsx
import { Box, Button } from '@ybouhjira/hyperkit';
import '@ybouhjira/hyperkit/dist/index.css';

function App() {
  return (
    <Box padding="lg">
      <Button variant="primary">Hello HyperKit!</Button>
    </Box>
  );
}

export default App;
```

## Next Steps

- [Quick Start](./quick-start) - Build your first HyperKit app
- [Theming](./theming) - Customize the look and feel
