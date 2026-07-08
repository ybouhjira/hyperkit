# ConfirmDialog

> Component

## Props

| Prop           | Type          | Required  | Default | Description |
| -------------- | ------------- | --------- | ------- | ----------- | --- |
| `open`         | `boolean`     | Yes       | -       | -           |
| `onClose`      | `() => void`  | Yes       | -       | -           |
| `onConfirm`    | `() => void`  | Yes       | -       | -           |
| `title`        | `string`      | No        | -       | -           |
| `children`     | `JSX.Element` | No        | -       | -           |
| `confirmLabel` | `string`      | No        | -       | -           |
| `cancelLabel`  | `string`      | No        | -       | -           |
| `variant`      | `'default'    | 'danger'` | No      | -           | -   |
| `loading`      | `boolean`     | No        | -       | -           |
| `class`        | `string`      | No        | -       | -           |

## Examples

### Basic Usage

```tsx
import { ConfirmDialog } from '@ybouhjira/hyperkit';

<ConfirmDialog>Content</ConfirmDialog>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
