# DocumentPage

> Component

## Props

| Prop          | Type                | Required     | Default | Description |
| ------------- | ------------------- | ------------ | ------- | ----------- | --- |
| `size`        | `'a4'               | 'letter'`    | No      | -           | -   |
| `orientation` | `'portrait'         | 'landscape'` | No      | -           | -   |
| `padding`     | `string`            | No           | -       | -           |
| `children`    | `JSX.Element`       | Yes          | -       | -           |
| `header`      | `JSX.Element`       | No           | -       | -           |
| `footer`      | `JSX.Element`       | No           | -       | -           |
| `pageNumber`  | `number`            | No           | -       | -           |
| `style`       | `JSX.CSSProperties` | No           | -       | -           |

## Examples

### Basic Usage

```tsx
import { DocumentPage } from '@ybouhjira/hyperkit';

<DocumentPage>Content</DocumentPage>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
