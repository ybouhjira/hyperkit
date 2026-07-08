import { Component, splitProps, createMemo } from 'solid-js';
import { Flex, FlexProps } from '../Flex';
import { SpaceToken } from '../layout';

export interface WrapProps extends Omit<FlexProps, 'wrap' | 'direction'> {
  /** Gap between wrapped items. Alias for gap prop.
   * @default 'sm' */
  spacing?: SpaceToken;
}

/** Flex container with automatic wrapping. Lays out children in a row and wraps them when space runs out. */
export const Wrap: Component<WrapProps> = (props) => {
  const [local, flexProps] = splitProps(props, ['spacing', 'gap']);

  const gapValue = createMemo(() => local.spacing ?? local.gap ?? 'sm');

  return <Flex direction="row" wrap="wrap" gap={gapValue()} {...flexProps} />;
};
