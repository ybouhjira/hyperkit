# MetricCard

> Component

## Props

| Prop             | Type                | Required  | Default    | Description |
| ---------------- | ------------------- | --------- | ---------- | ----------- | ------ | --------- | --- | --- | --- |
| `label`          | `string`            | Yes       | -          | -           |
| `value`          | `string             | number`   | Yes        | -           | -      |
| `variant`        | `'default'          | 'success' | 'warning'  | 'danger'    | 'info' | 'accent'` | No  | -   | -   |
| `icon`           | `JSX.Element`       | No        | -          | -           |
| `trend`          | `string`            | No        | -          | -           |
| `trendDirection` | `'up'               | 'down'    | 'neutral'` | No          | -      | -         |
| `size`           | `'sm'               | 'md'      | 'lg'`      | No          | -      | -         |
| `onClick`        | `() => void`        | No        | -          | -           |
| `class`          | `string`            | No        | -          | -           |
| `style`          | `JSX.CSSProperties` | No        | -          | -           |
| `unstyled`       | `boolean`           | No        | -          | -           |
| `children`       | `JSX.Element`       | No        | -          | -           |

## Examples

### Basic Usage

```tsx
import { MetricCard } from '@ybouhjira/hyperkit';

<MetricCard>Content</MetricCard>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
