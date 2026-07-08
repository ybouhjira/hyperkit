# RangeSlider

> Component

## Props

| Prop           | Type                                | Required | Default | Description |
| -------------- | ----------------------------------- | -------- | ------- | ----------- |
| `value`        | `[number, number]`                  | No       | -       | -           |
| `defaultValue` | `[number, number]`                  | No       | -       | -           |
| `onChange`     | `(value: [number, number]) => void` | No       | -       | -           |
| `min`          | `number`                            | No       | -       | -           |
| `max`          | `number`                            | No       | -       | -           |
| `step`         | `number`                            | No       | -       | -           |
| `minGap`       | `number`                            | No       | -       | -           |
| `label`        | `string`                            | No       | -       | -           |
| `showValues`   | `boolean`                           | No       | -       | -           |
| `disabled`     | `boolean`                           | No       | -       | -           |
| `class`        | `string`                            | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { RangeSlider } from '@ybouhjira/hyperkit';

<RangeSlider>Content</RangeSlider>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
