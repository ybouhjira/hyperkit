# Collapsible

> Component

## Props

| Prop           | Type                      | Required | Default | Description |
| -------------- | ------------------------- | -------- | ------- | ----------- |
| `open`         | `boolean`                 | No       | -       | -           |
| `defaultOpen`  | `boolean`                 | No       | -       | -           |
| `onOpenChange` | `(open: boolean) => void` | No       | -       | -           |
| `disabled`     | `boolean`                 | No       | -       | -           |
| `trigger`      | `JSX.Element`             | Yes      | -       | -           |
| `children`     | `JSX.Element`             | Yes      | -       | -           |
| `unstyled`     | `boolean`                 | No       | -       | -           |
| `classNames`   | `{                        |

    /** Class for the trigger button. */
    trigger?: string;
    /** Class for the chevron icon. */
    chevron?: string;
    /** Class for the content container. */
    content?: string;
    /** Class for the inner content wrapper. */
    inner?: string;

}`| No | - | - |
|`class`|`string`| No | - | - |
|`style`|`JSX.CSSProperties` | No | - | - |

## Examples

### Basic Usage

```tsx
import { Collapsible } from '@ybouhjira/hyperkit';

<Collapsible>Content</Collapsible>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
