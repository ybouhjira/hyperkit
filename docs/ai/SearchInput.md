# SearchInput

> Component

## Props

| Prop          | Type                      | Required | Default | Description |
| ------------- | ------------------------- | -------- | ------- | ----------- |
| `value`       | `string`                  | No       | -       | -           |
| `placeholder` | `string`                  | No       | -       | -           |
| `shortcut`    | `string`                  | No       | -       | -           |
| `onSearch`    | `(value: string) => void` | No       | -       | -           |
| `onChange`    | `(value: string) => void` | No       | -       | -           |
| `onClear`     | `() => void`              | No       | -       | -           |
| `class`       | `string`                  | No       | -       | -           |
| `autofocus`   | `boolean`                 | No       | -       | -           |
| `disabled`    | `boolean`                 | No       | -       | -           |
| `unstyled`    | `boolean`                 | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { SearchInput } from '@ybouhjira/hyperkit';

<SearchInput>Content</SearchInput>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
