# Input

> Component

## Props

| Prop          | Type                      | Required | Default    | Description |
| ------------- | ------------------------- | -------- | ---------- | ----------- | ------ | --- | --- | --- |
| `type`        | `'text'                   | 'email'  | 'password' | 'search'    | 'url'` | No  | -   | -   |
| `placeholder` | `string`                  | No       | -          | -           |
| `value`       | `string`                  | No       | -          | -           |
| `onInput`     | `(value: string) => void` | No       | -          | -           |
| `disabled`    | `boolean`                 | No       | -          | -           |
| `error`       | `string`                  | No       | -          | -           |
| `class`       | `string`                  | No       | -          | -           |
| `id`          | `string`                  | No       | -          | -           |
| `name`        | `string`                  | No       | -          | -           |
| `unstyled`    | `boolean`                 | No       | -          | -           |

## Examples

### Basic Usage

```tsx
import { Input } from '@ybouhjira/hyperkit';

<Input>Content</Input>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
