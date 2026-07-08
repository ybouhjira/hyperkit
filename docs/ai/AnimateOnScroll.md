# AnimateOnScroll

> Component

## Props

| Prop        | Type                | Required | Default    | Description |
| ----------- | ------------------- | -------- | ---------- | ----------- | ------------ | -------- | --- | --- | --- |
| `animation` | `'fadeIn'           | 'fadeUp' | 'fadeDown' | 'slideLeft' | 'slideRight' | 'scale'` | No  | -   | -   |
| `threshold` | `number`            | No       | -          | -           |
| `delay`     | `number`            | No       | -          | -           |
| `duration`  | `number`            | No       | -          | -           |
| `once`      | `boolean`           | No       | -          | -           |
| `children`  | `JSX.Element`       | Yes      | -          | -           |
| `class`     | `string`            | No       | -          | -           |
| `style`     | `JSX.CSSProperties` | No       | -          | -           |

## Examples

### Basic Usage

```tsx
import { AnimateOnScroll } from '@ybouhjira/hyperkit';

<AnimateOnScroll>Content</AnimateOnScroll>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
