---
sidebar_position: 1
---

# Installation

Install HyperKit and its peer dependencies:

```bash
npm install @ybouhjira/hyperkit solid-js @kobalte/core effect
```

## Peer Dependencies

| Package         | Version | Purpose               |
| --------------- | ------- | --------------------- |
| `solid-js`      | ^1.8.0  | SolidJS framework     |
| `@kobalte/core` | ^0.13.0 | Accessible primitives |
| `effect`        | ^3.0.0  | Functional effects    |

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
