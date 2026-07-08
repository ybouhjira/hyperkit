# Text

> Component

## Props

| Prop            | Type                                             | Required | Default  | Description |
| --------------- | ------------------------------------------------ | -------- | -------- | ----------- | ---- | ---- | --- | ------ | ------- | ------ | --- | --- | --- |
| `size`          | `FontSizeToken`                                  | No       | -        | -           |
| `weight`        | `FontWeightToken                                 | number`  | No       | -           | -    |
| `color`         | `TextColorToken`                                 | No       | -        | -           |
| `align`         | `'left'                                          | 'center' | 'right'` | No          | -    | -    |
| `truncate`      | `boolean`                                        | No       | -        | -           |
| `lineClamp`     | `number`                                         | No       | -        | -           |
| `gradient`      | `string`                                         | No       | -        | -           |
| `letterSpacing` | `string`                                         | No       | -        | -           |
| `lineHeight`    | `string                                          | number`  | No       | -           | -    |
| `maxW`          | `string                                          | number`  | No       | -           | -    |
| `whiteSpace`    | `'normal'                                        | 'nowrap' | 'pre'    | 'pre-wrap'` | No   | -    | -   |
| `as`            | `'h1'                                            | 'h2'     | 'h3'     | 'h4'        | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'div'` | No  | -   | -   |
| `mb`            | `SpaceToken`                                     | No       | -        | -           |
| `mt`            | `SpaceToken`                                     | No       | -        | -           |
| `class`         | `string`                                         | No       | -        | -           |
| `style`         | `JSX.CSSProperties`                              | No       | -        | -           |
| `children`      | `JSX.Element`                                    | No       | -        | -           |
| `onClick`       | `JSX.EventHandlerUnion<HTMLElement, MouseEvent>` | No       | -        | -           |
| `title`         | `string`                                         | No       | -        | -           |

## Examples

### Basic Usage

```tsx
import { Text } from '@ybouhjira/hyperkit';

<Text>Content</Text>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
