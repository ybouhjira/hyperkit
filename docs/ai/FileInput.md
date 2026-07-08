# FileInput

> Component

## Props

| Prop          | Type                | Required | Default        | Description |
| ------------- | ------------------- | -------- | -------------- | ----------- | --- | --- |
| `value`       | `File               | File[]   | null`          | No          | -   | -   |
| `onChange`    | `(files: File       | File[]   | null) => void` | Yes         | -   | -   |
| `mode`        | `'single'           | 'list'`  | No             | -           | -   |
| `accept`      | `string`            | No       | -              | -           |
| `maxSize`     | `number`            | No       | -              | -           |
| `placeholder` | `string`            | No       | -              | -           |
| `disabled`    | `boolean`           | No       | -              | -           |
| `class`       | `string`            | No       | -              | -           |
| `style`       | `JSX.CSSProperties` | No       | -              | -           |

## Examples

### Basic Usage

```tsx
import { FileInput } from '@ybouhjira/hyperkit';

<FileInput>Content</FileInput>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
