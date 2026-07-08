# ProjectCard

> Component

## Props

| Prop          | Type         | Required | Default | Description |
| ------------- | ------------ | -------- | ------- | ----------- |
| `name`        | `string`     | Yes      | -       | -           |
| `icon`        | `string`     | No       | -       | -           |
| `color`       | `string`     | No       | -       | -           |
| `subtitle`    | `string`     | No       | -       | -           |
| `description` | `string`     | No       | -       | -           |
| `pinned`      | `boolean`    | No       | -       | -           |
| `onTogglePin` | `() => void` | No       | -       | -           |
| `onClick`     | `() => void` | No       | -       | -           |
| `class`       | `string`     | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ProjectCard } from '@ybouhjira/hyperkit';

<ProjectCard>Content</ProjectCard>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
