import { Component, JSX, splitProps } from 'solid-js';
import { Box, BoxProps } from '../Box';
import { SpaceToken, mapSpace, resolveSize } from '../layout';

export interface SpacerProps extends BoxProps {
  /** Fixed size. If omitted, uses flex:1 to fill available space. */
  size?: SpaceToken | string | number;
  /** Which dimension to space.
   * @default 'horizontal' */
  axis?: 'horizontal' | 'vertical';
}

const spaceTokens = new Set(['0', 'px', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']);

function resolveSpacerSize(size: SpaceToken | string | number): string {
  if (typeof size === 'string' && spaceTokens.has(size)) {
    return mapSpace(size as SpaceToken);
  }
  return resolveSize(size as string | number);
}

/** Flex child that fills available space or provides fixed spacing. */
export const Spacer: Component<SpacerProps> = (props) => {
  const [local, boxProps] = splitProps(props, ['size', 'axis', 'style']);

  const computedStyle = (): JSX.CSSProperties => {
    const style: JSX.CSSProperties = { ...local.style };

    if (local.size != null) {
      const resolved = resolveSpacerSize(local.size);
      if (local.axis === 'vertical') {
        style.height = resolved;
      } else {
        style.width = resolved;
      }
      style['flex-shrink'] = 0;
    } else {
      style.flex = 1;
    }

    return style;
  };

  return <Box style={computedStyle()} {...boxProps} />;
};
