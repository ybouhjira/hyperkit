# Box

> Component

## Props

| Prop             | Type                                             | Required                     | Default   | Description    |
| ---------------- | ------------------------------------------------ | ---------------------------- | --------- | -------------- | ------------- | -------------- | ------- | --- | --- | --- |
| `p`              | `SpaceToken`                                     | No                           | -         | -              |
| `px`             | `SpaceToken`                                     | No                           | -         | -              |
| `py`             | `SpaceToken`                                     | No                           | -         | -              |
| `pt`             | `SpaceToken`                                     | No                           | -         | -              |
| `pr`             | `SpaceToken`                                     | No                           | -         | -              |
| `pb`             | `SpaceToken`                                     | No                           | -         | -              |
| `pl`             | `SpaceToken`                                     | No                           | -         | -              |
| `m`              | `SpaceToken`                                     | No                           | -         | -              |
| `mx`             | `SpaceToken`                                     | No                           | -         | -              |
| `my`             | `SpaceToken`                                     | No                           | -         | -              |
| `mt`             | `SpaceToken`                                     | No                           | -         | -              |
| `mr`             | `SpaceToken`                                     | No                           | -         | -              |
| `mb`             | `SpaceToken`                                     | No                           | -         | -              |
| `ml`             | `SpaceToken`                                     | No                           | -         | -              |
| `w`              | `string                                          | number`                      | No        | -              | -             |
| `h`              | `string                                          | number`                      | No        | -              | -             |
| `minW`           | `string                                          | number`                      | No        | -              | -             |
| `minH`           | `string                                          | number`                      | No        | -              | -             |
| `maxW`           | `string                                          | number`                      | No        | -              | -             |
| `maxH`           | `string                                          | number`                      | No        | -              | -             |
| `bg`             | `BgToken`                                        | No                           | -         | -              |
| `color`          | `TextColorToken`                                 | No                           | -         | -              |
| `borderRadius`   | `RadiusToken`                                    | No                           | -         | -              |
| `shadow`         | `ShadowToken`                                    | No                           | -         | -              |
| `border`         | `boolean`                                        | No                           | -         | -              |
| `borderColor`    | `'default'                                       | 'subtle'                     | 'accent'` | No             | -             | -              |
| `borderBottom`   | `boolean`                                        | No                           | -         | -              |
| `borderTop`      | `boolean`                                        | No                           | -         | -              |
| `borderLeft`     | `boolean`                                        | No                           | -         | -              |
| `borderRight`    | `boolean`                                        | No                           | -         | -              |
| `position`       | `'relative'                                      | 'absolute'                   | 'fixed'   | 'sticky'`      | No            | -              | -       |
| `top`            | `string                                          | number`                      | No        | -              | -             |
| `right`          | `string                                          | number`                      | No        | -              | -             |
| `bottom`         | `string                                          | number`                      | No        | -              | -             |
| `left`           | `string                                          | number`                      | No        | -              | -             |
| `inset`          | `string                                          | number`                      | No        | -              | -             |
| `zIndex`         | `ZToken                                          | number`                      | No        | -              | -             |
| `overflow`       | `'hidden'                                        | 'auto'                       | 'scroll'  | 'visible'`     | No            | -              | -       |
| `display`        | `'block'                                         | 'flex'                       | 'grid'    | 'inline'       | 'inline-flex' | 'inline-block' | 'none'` | No  | -   | -   |
| `hoverBg`        | `BgToken`                                        | No                           | -         | -              |
| `hoverColor`     | `TextColorToken`                                 | No                           | -         | -              |
| `cursor`         | `'pointer'                                       | 'default'                    | 'grab'    | 'not-allowed'` | No            | -              | -       |
| `transition`     | `boolean`                                        | No                           | -         | -              |
| `opacity`        | `number`                                         | No                           | -         | -              |
| `backdropFilter` | `string`                                         | No                           | -         | -              |
| `filter`         | `string`                                         | No                           | -         | -              |
| `transform`      | `string`                                         | No                           | -         | -              |
| `pointerEvents`  | `'none'                                          | 'auto'`                      | No        | -              | -             |
| `animation`      | `string`                                         | No                           | -         | -              |
| `background`     | `string`                                         | No                           | -         | -              |
| `borderWidth`    | `string`                                         | No                           | -         | -              |
| `borderStyle`    | `'solid'                                         | 'dashed'                     | 'dotted'  | 'none'`        | No            | -              | -       |
| `flex`           | `string                                          | number`                      | No        | -              | -             |
| `alignSelf`      | `'start'                                         | 'center'                     | 'end'     | 'stretch'`     | No            | -              | -       |
| `as`             | `string`                                         | No                           | -         | -              |
| `class`          | `string`                                         | No                           | -         | -              |
| `style`          | `JSX.CSSProperties`                              | No                           | -         | -              |
| `children`       | `JSX.Element`                                    | No                           | -         | -              |
| `onClick`        | `JSX.EventHandlerUnion<HTMLElement, MouseEvent>` | No                           | -         | -              |
| `onMouseDown`    | `JSX.EventHandlerUnion<HTMLElement, MouseEvent>` | No                           | -         | -              |
| `onDragOver`     | `JSX.EventHandlerUnion<HTMLElement, DragEvent>`  | No                           | -         | -              |
| `onDragLeave`    | `JSX.EventHandlerUnion<HTMLElement, DragEvent>`  | No                           | -         | -              |
| `onDrop`         | `JSX.EventHandlerUnion<HTMLElement, DragEvent>`  | No                           | -         | -              |
| `ref`            | `HTMLElement                                     | ((el: HTMLElement) => void)` | No        | -              | -             |

## Examples

### Basic Usage

```tsx
import { Box } from '@ybouhjira/hyperkit';

<Box>Content</Box>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
