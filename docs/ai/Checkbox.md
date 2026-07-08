# Checkbox

> Component

## Props

| Prop             | Type                                   | Required | Default | Description |
| ---------------- | -------------------------------------- | -------- | ------- | ----------- | --- | --- |
| `checked`        | `boolean`                              | No       | -       | -           |
| `defaultChecked` | `boolean`                              | No       | -       | -           |
| `onChange`       | `(checked: boolean) => void`           | No       | -       | -           |
| `label`          | `string`                               | No       | -       | -           |
| `disabled`       | `boolean`                              | No       | -       | -           |
| `indeterminate`  | `boolean`                              | No       | -       | -           |
| `size`           | `'sm'                                  | 'md'     | 'lg'`   | No          | -   | -   |
| `class`          | `string`                               | No       | -       | -           |
| `style`          | `import('solid-js').JSX.CSSProperties` | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { Checkbox } from '@ybouhjira/hyperkit';

<Checkbox>Content</Checkbox>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
