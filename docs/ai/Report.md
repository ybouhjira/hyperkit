# Report

> Component

## Props

| Prop       | Type                                           | Required | Default | Description |
| ---------- | ---------------------------------------------- | -------- | ------- | ----------- |
| `schema`   | `ReportSchema`                                 | Yes      | -       | -           |
| `class`    | `string`                                       | No       | -       | -           |
| `embedded` | `boolean`                                      | No       | -       | -           |
| `onSubmit` | `(responses: Record<string, unknown>) => void` | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { Report } from '@ybouhjira/hyperkit';

<Report>Content</Report>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
