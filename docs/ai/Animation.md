# Animation System

> Animation utilities including transitions and scroll-based reveals

## Components

- **ScrollReveal** — Scroll-triggered animations (see ScrollReveal.md)
- **Transition** — Animated transitions between states
- **AnimationProvider** — Animation settings provider

## Transition Component

Animate elements when they enter/exit the DOM.

### Props

| Prop       | Type                           | Default      | Description        |
| ---------- | ------------------------------ | ------------ | ------------------ |
| `show`     | `boolean`                      | **required** | Show/hide state    |
| `type`     | `'fade' \| 'slide' \| 'scale'` | `'fade'`     | Animation type     |
| `duration` | `number`                       | `300`        | Duration in ms     |
| `children` | `JSX.Element`                  | **required** | Content to animate |

### Examples

```tsx
import { Transition } from '@ybouhjira/hyperkit';

function Modal() {
  const [isOpen, setOpen] = createSignal(false);

  return (
    <Transition show={isOpen()} type="fade" duration={200}>
      <div>Modal content</div>
    </Transition>
  );
}
```

### Slide Transition

```tsx
<Transition show={showPanel()} type="slide" duration={300}>
  <SidePanel />
</Transition>
```

## AnimationProvider

Global animation settings.

### Props

| Prop            | Type      | Default | Description                         |
| --------------- | --------- | ------- | ----------------------------------- |
| `reducedMotion` | `boolean` | -       | Respect prefers-reduced-motion      |
| `duration`      | `number`  | `300`   | Default duration for all animations |

```tsx
function App() {
  return (
    <AnimationProvider reducedMotion duration={200}>
      <YourApp />
    </AnimationProvider>
  );
}
```

## CSS Animation Tokens

HyperKit provides CSS custom properties for consistent animation timing:

- `--sk-duration-instant`: 100ms
- `--sk-duration-fast`: 200ms
- `--sk-duration-normal`: 300ms
- `--sk-duration-slow`: 500ms

**Usage:**

```tsx
<Box transition style={{ 'transition-duration': 'var(--sk-duration-slow)' }}>
  Slow transition
</Box>
```

## Gotchas

- **Respects reduced motion**: Components honor `prefers-reduced-motion` media query
- **Exit animations**: Transition component waits for exit animation before removing from DOM
- **GPU acceleration**: Animations use transform/opacity for better performance
- **Nested transitions**: Can nest Transition components for complex sequences

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
