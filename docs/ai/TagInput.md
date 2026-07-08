# TagInput

> Component

## Props

| Prop              | Type                       | Required | Default | Description |
| ----------------- | -------------------------- | -------- | ------- | ----------- |
| `value`           | `string[]`                 | No       | -       | -           |
| `defaultValue`    | `string[]`                 | No       | -       | -           |
| `onChange`        | `(tags: string[]) => void` | No       | -       | -           |
| `suggestions`     | `string[]`                 | No       | -       | -           |
| `placeholder`     | `string`                   | No       | -       | -           |
| `maxTags`         | `number`                   | No       | -       | -           |
| `allowDuplicates` | `boolean`                  | No       | -       | -           |
| `disabled`        | `boolean`                  | No       | -       | -           |
| `label`           | `string`                   | No       | -       | -           |
| `class`           | `string`                   | No       | -       | -           |
| `style`           | `JSX.CSSProperties`        | No       | -       | -           |
| `unstyled`        | `boolean`                  | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { TagInput } from '@ybouhjira/hyperkit';

<TagInput>Content</TagInput>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
