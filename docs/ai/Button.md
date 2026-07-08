# Button

> Component

## Props

| Prop         | Type       | Required    | Default | Description |
| ------------ | ---------- | ----------- | ------- | ----------- | --------- | ------- | --- | --- | --- |
| `variant`    | `'primary' | 'secondary' | 'ghost' | 'danger'    | 'outline' | 'link'` | No  | -   | -   |
| `size`       | `'sm'      | 'md'        | 'lg'`   | No          | -         | -       |
| `loading`    | `boolean`  | No          | -       | -           |
| `disabled`   | `boolean`  | No          | -       | -           |
| `fullWidth`  | `boolean`  | No          | -       | -           |
| `rounded`    | `boolean`  | No          | -       | -           |
| `as`         | `string`   | No          | -       | -           |
| `unstyled`   | `boolean`  | No          | -       | -           |
| `classNames` | `{         |

    /** Class for root button element. */
    root?: string;
    /** Class for loading spinner element. */
    spinner?: string;

}`| No | - | - |
|`class`|`string`| No | - | - |
|`style`|`JSX.CSSProperties`| No | - | - |
|`children`|`JSX.Element`| Yes | - | - |
|`onClick`|`(e: MouseEvent) => void`| No | - | - |
|`type`|`'button' | 'submit' | 'reset'` | No | - | - |

## Examples

### Basic Usage

```tsx
import { Button } from '@ybouhjira/hyperkit';

<Button>Content</Button>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
