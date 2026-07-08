---
title: MetricCard
description: KPI card with value, label, and trend.
slug: /components/display/MetricCard
---

# MetricCard

KPI card with value, label, and trend.

```tsx
import { MetricCard } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<MetricCard label="Total Projects" value="2,500" />
```

### Success

```tsx
<MetricCard label="Active Users" value="12,345" variant="success" />
```

### Warning

```tsx
<MetricCard label="Pending Tasks" value="42" variant="warning" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `label` * | `string` | — | Metric label (e.g., "Total Projects"). |
| `value` * | `string \| number` | — | Metric value (e.g., "2,500" or 42). |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'accent'` | `'default'` | Color variant for the value. |
| `icon` | `JSX.Element` | — | Optional icon element shown before the label. |
| `trend` | `string` | — | Optional trend indicator (e.g., "+12%", "-3"). |
| `trendDirection` | `'up' \| 'down' \| 'neutral'` | `'neutral'` | Direction of the trend (affects color). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant. |
| `onClick` | `() => void` | — | Click handler. |
| `class` | `string` | — | Additional CSS class for root element. |
| `style` | `JSX.CSSProperties` | — | Inline styles for root element. |
| `unstyled` | `boolean` | `false` | Remove all default styles, only apply classNames. |
| `children` | `JSX.Element` | — | Optional children rendered in extra section. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-muted`, `--sk-bg-secondary`, `--sk-border`, `--sk-duration-fast`, `--sk-error`, `--sk-font-mono`, `--sk-font-size-lg`, `--sk-font-size-md`, `--sk-font-size-xl`, `--sk-font-size-xs`, `--sk-info`, `--sk-metric-bg`, `--sk-metric-border-color`, `--sk-metric-extra-border-color`, `--sk-metric-extra-margin-top`, `--sk-metric-extra-padding-top`, `--sk-metric-header-gap`, `--sk-metric-header-margin-bottom`, `--sk-metric-hover-border-color`, `--sk-metric-icon-color`, `--sk-metric-label-color`, `--sk-metric-label-font-size`, `--sk-metric-label-letter-spacing`, `--sk-metric-lg-padding`, `--sk-metric-lg-value-font-size`, `--sk-metric-md-padding`, `--sk-metric-md-value-font-size`, `--sk-metric-radius`, `--sk-metric-sm-padding`, `--sk-metric-sm-value-font-size`, `--sk-metric-trend-down-color`, `--sk-metric-trend-font-size`, `--sk-metric-trend-neutral-color`, `--sk-metric-trend-up-color`, `--sk-metric-value-accent-color`, `--sk-metric-value-danger-color`, `--sk-metric-value-default-color`, `--sk-metric-value-font-family`, `--sk-metric-value-font-size`, `--sk-metric-value-info-color`, `--sk-metric-value-margin-bottom`, `--sk-metric-value-success-color`, `--sk-metric-value-warning-color`, `--sk-radius-md`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-success`, `--sk-text-muted`, `--sk-text-primary`, `--sk-warning`
