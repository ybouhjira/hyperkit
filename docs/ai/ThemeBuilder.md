# ThemeBuilder

> Component

## Props

| Prop            | Type                           | Required | Default | Description |
| --------------- | ------------------------------ | -------- | ------- | ----------- |
| `initialTheme`  | `Partial<ThemeConfig>`         | No       | -       | -           |
| `onThemeChange` | `(theme: ThemeConfig) => void` | No       | -       | -           |
| `onExport`      | `(code: string) => void`       | No       | -       | -           |
| `class`         | `string`                       | No       | -       | -           |
| `style`         | `JSX.CSSProperties`            | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ThemeBuilder } from '@ybouhjira/hyperkit';

<ThemeBuilder>Content</ThemeBuilder>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
