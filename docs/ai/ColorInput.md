# ColorInput

> Component

## Props

| Prop           | Type                      | Required | Default | Description |
| -------------- | ------------------------- | -------- | ------- | ----------- | --- | --- |
| `value`        | `string`                  | No       | -       | -           |
| `defaultValue` | `string`                  | No       | -       | -           |
| `onChange`     | `(color: string) => void` | No       | -       | -           |
| `format`       | `'hex'                    | 'rgb'    | 'hsl'`  | No          | -   | -   |
| `showAlpha`    | `boolean`                 | No       | -       | -           |
| `presets`      | `string[]`                | No       | -       | -           |
| `label`        | `string`                  | No       | -       | -           |
| `disabled`     | `boolean`                 | No       | -       | -           |
| `size`         | `'sm'                     | 'md'`    | No      | -           | -   |
| `class`        | `string`                  | No       | -       | -           |
| `style`        | `JSX.CSSProperties`       | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ColorInput } from '@ybouhjira/hyperkit';

<ColorInput>Content</ColorInput>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
