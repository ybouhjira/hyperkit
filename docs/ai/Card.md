# Card

> Component

## Props

| Prop         | Type          | Required   | Default     | Description |
| ------------ | ------------- | ---------- | ----------- | ----------- | --- | --- | --- |
| `variant`    | `'default'    | 'outlined' | 'elevated'` | No          | -   | -   |
| `padding`    | `'none'       | 'sm'       | 'md'        | 'lg'`       | No  | -   | -   |
| `onClick`    | `() => void`  | No         | -           | -           |
| `hoverable`  | `boolean`     | No         | -           | -           |
| `children`   | `JSX.Element` | Yes        | -           | -           |
| `unstyled`   | `boolean`     | No         | -           | -           |
| `classNames` | `{            |

    /** Class for root card element. */
    root?: string;

}`| No | - | - |
|`class`|`string`| No | - | - |
|`style`|`JSX.CSSProperties` | No | - | - |

## Examples

### Basic Usage

```tsx
import { Card } from '@ybouhjira/hyperkit';

<Card>Content</Card>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
