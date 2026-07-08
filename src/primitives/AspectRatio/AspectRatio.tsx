import { Component, JSX, splitProps } from 'solid-js';
import { Box, BoxProps } from '../Box';

export interface AspectRatioProps extends BoxProps {
  /** Width-to-height ratio (e.g., 16/9, 4/3, 1).
   * @default 1 */
  ratio?: number;
}

/** Container that maintains a specific aspect ratio using CSS aspect-ratio property. */
export const AspectRatio: Component<AspectRatioProps> = (props) => {
  const [local, boxProps] = splitProps(props, ['ratio', 'style']);

  const computedStyle = (): JSX.CSSProperties => {
    const style: JSX.CSSProperties = { ...local.style };
    style['aspect-ratio'] = `${local.ratio ?? 1}`;
    style.overflow = style.overflow ?? 'hidden';
    return style;
  };

  return <Box style={computedStyle()} {...boxProps} />;
};
