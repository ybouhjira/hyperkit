---
title: Animation System
sidebar_position: 4
description: Transition presets, scroll-triggered reveals, and global animation settings.
---

# Animation System

The animation system provides CSS-driven transitions with named presets, scroll-triggered reveals, and a global provider that persists user preferences and respects `prefers-reduced-motion`.

## API

| Export                              | Description                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `AnimationProvider`                 | Animation context — `localStorage` persistence, respects `prefers-reduced-motion`          |
| `Transition`                        | CSS transition wrapper; presets: `fade`, `slide-up/down/left/right`, `scale`, `scale-fade` |
| `ScrollReveal`                      | IntersectionObserver reveal (fade-up, fade-in, scale-in, slide-left/right)                 |
| `AnimateOnScroll`                   | CSS class-based scroll animation trigger                                                   |
| `useAnimation`                      | Returns `{ config, setEnabled, setSpeedMultiplier, isActive }`                             |
| Preset functions                    | `fadeIn`, `slideUp`, `slideDown`, `slideLeft`, `slideRight`, `scaleIn`, `scaleFade`        |
| `enterAnimation` / `animationClass` | Low-level animation class helpers                                                          |

Types: `AnimationConfig`, `TransitionPreset`, `TransitionConfig`.

## Transitions

Wrap conditional content in `Transition` to animate enter/exit:

```tsx
import { Transition } from '@ybouhjira/hyperkit';
import { createSignal, Show } from 'solid-js';

function Notice() {
  const [visible, setVisible] = createSignal(false);

  return (
    <>
      <button onClick={() => setVisible(!visible())}>Toggle</button>
      <Transition preset="slide-up">
        <Show when={visible()}>
          <div>Saved successfully.</div>
        </Show>
      </Transition>
    </>
  );
}
```

## Scroll Reveals

`ScrollReveal` animates content into view as it enters the viewport — ideal for landing pages and long documents:

```tsx
import { ScrollReveal } from '@ybouhjira/hyperkit';

<ScrollReveal preset="fade-up" delay={100}>
  <FeatureCard />
</ScrollReveal>
```

## Global Control

`AnimationProvider` gives users a single switch for all motion. Settings persist to `localStorage`, and the provider automatically disables animation when the OS requests reduced motion:

```tsx
import { AnimationProvider, useAnimation } from '@ybouhjira/hyperkit';

function MotionToggle() {
  const animation = useAnimation();
  return (
    <label>
      <input
        type="checkbox"
        checked={animation.config.enabled}
        onChange={(e) => animation.setEnabled(e.currentTarget.checked)}
      />
      Enable animations
    </label>
  );
}
```

## Motion Tokens

Durations and easings come from design tokens so themes control motion consistently: `--sk-duration-fast` (150ms), `--sk-duration-normal` (200ms), `--sk-duration-slow` (300ms), `--sk-ease-default`, `--sk-ease-out`, `--sk-ease-bounce`. See the [CSS Variables guide](../guides/css-variables.md).
