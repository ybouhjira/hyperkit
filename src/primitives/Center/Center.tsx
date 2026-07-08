import { Component } from 'solid-js';
import { Flex, FlexProps } from '../Flex';

/** Props for the Center component (inherits all FlexProps) */
export type CenterProps = FlexProps;

/** Flex container that centers its children both horizontally and vertically. */
export const Center: Component<CenterProps> = (props) => {
  return <Flex align="center" justify="center" {...props} />;
};
