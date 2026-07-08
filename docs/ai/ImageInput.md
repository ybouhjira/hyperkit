# ImageInput

> Component

## Props

| Prop               | Type                | Required    | Default        | Description |
| ------------------ | ------------------- | ----------- | -------------- | ----------- | --- | --- |
| `value`            | `File               | File[]      | null`          | No          | -   | -   |
| `onChange`         | `(files: File       | File[]      | null) => void` | Yes         | -   | -   |
| `mode`             | `'single'           | 'multiple'` | No             | -           | -   |
| `accept`           | `string`            | No          | -              | -           |
| `maxSize`          | `number`            | No          | -              | -           |
| `placeholder`      | `string`            | No          | -              | -           |
| `previewSize`      | `number`            | No          | -              | -           |
| `disabled`         | `boolean`           | No          | -              | -           |
| `class`            | `string`            | No          | -              | -           |
| `style`            | `JSX.CSSProperties` | No          | -              | -           |
| `onError`          | `(error: {          |
| type: 'validation' | 'format'            | 'size'      | 'corrupt';     |

    message: string;
    file?: File;

}) => void`| No | - | - |
|`error`|`string` | No | - | - |

## Examples

### Basic Usage

```tsx
import { ImageInput } from '@ybouhjira/hyperkit';

<ImageInput>Content</ImageInput>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
