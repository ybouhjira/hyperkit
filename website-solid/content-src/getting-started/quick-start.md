---
sidebar_position: 2
---

# Quick Start

Get up and running with HyperKit in minutes.

## Setup ThemeProvider

Wrap your app with `ThemeProvider` to enable theming:

```tsx
import { render } from 'solid-js/web';
import { ThemeProvider } from '@ybouhjira/hyperkit';
import '@ybouhjira/hyperkit/dist/index.css';
import App from './App';

render(
  () => (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  ),
  document.getElementById('root')!
);
```

## Basic Components

### Box - Layout Container

```tsx
import { Box } from '@ybouhjira/hyperkit';

function Example() {
  return (
    <Box padding="lg" backgroundColor="neutral-100">
      <h1>Welcome to HyperKit</h1>
    </Box>
  );
}
```

### Button - Interactive Element

```tsx
import { Button } from '@ybouhjira/hyperkit';

function Example() {
  const handleClick = () => console.log('Clicked!');

  return (
    <Button variant="primary" onClick={handleClick}>
      Click Me
    </Button>
  );
}
```

### Text - Typography

```tsx
import { Text } from '@ybouhjira/hyperkit';

function Example() {
  return (
    <>
      <Text variant="heading1">Main Title</Text>
      <Text variant="body">Regular paragraph text.</Text>
    </>
  );
}
```

## Simple Example App

```tsx
import { Box, Button, Text, Card } from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

function CounterApp() {
  const [count, setCount] = createSignal(0);

  return (
    <Box padding="xl">
      <Card padding="lg">
        <Text variant="heading2">Counter Example</Text>
        <Box marginTop="md">
          <Text variant="body">Count: {count()}</Text>
        </Box>
        <Box marginTop="md" display="flex" gap="sm">
          <Button onClick={() => setCount(count() + 1)}>Increment</Button>
          <Button variant="secondary" onClick={() => setCount(0)}>
            Reset
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

export default CounterApp;
```

## Next Steps

- Learn about [Theming](./theming) to customize your app
- Copy real UIs from the [Composition Patterns](../guides/patterns.md)
- Browse the [component catalog](../components/index.md) for all available components
