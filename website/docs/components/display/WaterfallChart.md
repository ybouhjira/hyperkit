---
title: WaterfallChart
description: Waterfall/bar breakdown chart.
slug: /components/display/WaterfallChart
---

# WaterfallChart

Waterfall/bar breakdown chart.

```tsx
import { WaterfallChart } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<WaterfallChart
  items={[
      {
        id: 'dns',
        label: 'DNS Lookup',
        start: 0,
        end: 20,
        color: 'var(--sk-accent)',
        category: 'network'
      },
      {
        id: 'connect',
        label: 'TCP Connect',
        start: 20,
        end: 50,
        color: 'var(--sk-success)',
        category: 'network'
      },
      {
        id: 'ttfb',
        label: 'TTFB',
        start: 50,
        end: 150,
        color: 'var(--sk-warning)',
        category: 'server'
      },
      {
        id: 'download',
        label: 'Download',
        start: 150,
        end: 320,
        color: 'var(--sk-info)',
        category: 'network'
      },
      {
        id: 'parse',
        label: 'Parse HTML',
        start: 320,
        end: 380,
        color: 'var(--sk-accent)',
        category: 'browser'
      },
      {
        id: 'js',
        label: 'Execute JS',
        start: 380,
        end: 520,
        color: 'var(--sk-error)',
        category: 'browser'
      }
    ]}
/>
```

### Overlapping

```tsx
<WaterfallChart
  items={[
      {
        id: 'req1',
        label: 'Image 1',
        start: 0,
        end: 200,
        color: 'var(--sk-accent)'
      },
      {
        id: 'req2',
        label: 'Image 2',
        start: 50,
        end: 180,
        color: 'var(--sk-success)'
      },
      {
        id: 'req3',
        label: 'Font',
        start: 100,
        end: 300,
        color: 'var(--sk-warning)'
      },
      {
        id: 'req4',
        label: 'Script',
        start: 200,
        end: 450,
        color: 'var(--sk-error)'
      }
    ]}
/>
```

### Empty

```tsx
<WaterfallChart items={[]} />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `items` * | `WaterfallItem[]` | — | Array of timeline items to render. |
| `height` | `number` | `24` | Row height in pixels. |
| `labelWidth` | `number` | `120` | Width of the label column in pixels. |
| `tickCount` | `number` | `5` | Number of tick marks on the time axis header. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `import('solid-js').JSX.CSSProperties` | — | Inline styles. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-tertiary`, `--sk-border`, `--sk-font-size-xs`, `--sk-radius-sm`, `--sk-space-sm`, `--sk-text-muted`, `--sk-text-secondary`
