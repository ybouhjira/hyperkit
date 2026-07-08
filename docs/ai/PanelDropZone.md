# PanelDropZone

> Component

## Props

| Prop           | Type                                                 | Required | Default | Description |
| -------------- | ---------------------------------------------------- | -------- | ------- | ----------- |
| `position`     | `PanelPosition`                                      | Yes      | -       | -           |
| `active`       | `boolean`                                            | Yes      | -       | -           |
| `visible`      | `boolean`                                            | Yes      | -       | -           |
| `onRegister`   | `(position: PanelPosition, el: HTMLElement) => void` | Yes      | -       | -           |
| `onUnregister` | `(position: PanelPosition) => void`                  | Yes      | -       | -           |
| `style`        | `JSX.CSSProperties`                                  | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { PanelDropZone } from '@ybouhjira/hyperkit';

<PanelDropZone>Content</PanelDropZone>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
