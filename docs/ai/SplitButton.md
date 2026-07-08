# SplitButton

> Component

## Props

| Prop           | Type                      | Required  | Default   | Description |
| -------------- | ------------------------- | --------- | --------- | ----------- | --- | --- |
| `label`        | `string`                  | Yes       | -         | -           |
| `icon`         | `string`                  | No        | -         | -           |
| `onClick`      | `() => void`              | Yes       | -         | -           |
| `options`      | `SplitButtonOption[]`     | Yes       | -         | -           |
| `variant`      | `'default'                | 'primary' | 'danger'` | No          | -   | -   |
| `size`         | `'sm'                     | 'md'`     | No        | -           | -   |
| `disabled`     | `boolean`                 | No        | -         | -           |
| `class`        | `string`                  | No        | -         | -           |
| `open`         | `boolean`                 | No        | -         | -           |
| `onOpenChange` | `(open: boolean) => void` | No        | -         | -           |

## Examples

### Basic Usage

```tsx
import { SplitButton } from '@ybouhjira/hyperkit';

<SplitButton>Content</SplitButton>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
