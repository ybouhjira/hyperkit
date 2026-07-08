# VideoInput

> Component

## Props

| Prop               | Type          | Required | Default        | Description |
| ------------------ | ------------- | -------- | -------------- | ----------- | --- | --- |
| `value`            | `File         | File[]   | null`          | No          | -   | -   |
| `onChange`         | `(files: File | File[]   | null) => void` | Yes         | -   | -   |
| `mode`             | `'single'     | 'list'`  | No             | -           | -   |
| `accept`           | `string`      | No       | -              | -           |
| `maxSize`          | `number`      | No       | -              | -           |
| `placeholder`      | `string`      | No       | -              | -           |
| `disabled`         | `boolean`     | No       | -              | -           |
| `class`            | `string`      | No       | -              | -           |
| `onError`          | `(error: {    |
| type: 'validation' | 'format'      | 'size'   | 'corrupt';     |

    message: string;
    file?: File;

}) => void`| No | - | - |
|`error`|`string` | No | - | - |

## Examples

### Basic Usage

```tsx
import { VideoInput } from '@ybouhjira/hyperkit';

<VideoInput>Content</VideoInput>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
