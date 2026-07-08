import { Component, splitProps, createMemo } from 'solid-js';
import { Flex, FlexProps } from '../Flex';

/** Props for the Stack component. */
export interface StackProps extends Omit<FlexProps, 'direction' | 'wrap'> {
  /** Stack direction.
   * @default 'vertical' */
  direction?: 'vertical' | 'horizontal';
  /** Allow children to wrap to the next line when they exceed the container's main-axis size.
   * Sets `flex-wrap: wrap` on the underlying flex container.
   * @default false */
  wrap?: boolean;
}

/**
 * Convenience wrapper for Flex with simplified direction API. Stacks children vertically or horizontally.
 *
 * @example
 * ```tsx
 * import { Stack, Input, Button, Text } from "@ybouhjira/hyperkit";
 *
 * // Vertical form layout (default)
 * <Stack gap="md">
 *   <Text as="h2" size="xl" weight="semibold">Create Account</Text>
 *   <Input placeholder="Email" type="email" />
 *   <Input placeholder="Password" type="password" />
 *   <Button fullWidth>Sign Up</Button>
 * </Stack>
 *
 * // Horizontal button group
 * <Stack direction="horizontal" gap="sm" align="center">
 *   <Button variant="ghost" size="sm">Cancel</Button>
 *   <Button variant="primary" size="sm">Confirm</Button>
 * </Stack>
 *
 * // Tight list of settings items
 * <Stack gap="xs">
 *   <For each={settings}>{(item) => <SettingRow {...item} />}</For>
 * </Stack>
 * ```
 *
 * @see Flex - for full flexbox control
 * @see Grid - for two-dimensional layouts
 */
export const Stack: Component<StackProps> = (props) => {
  const [local, flexProps] = splitProps(props, ['direction', 'gap', 'wrap']);

  const flexDirection = createMemo(() => (local.direction === 'horizontal' ? 'row' : 'column'));
  const gapValue = createMemo(() => local.gap ?? 'md');
  const wrapValue = createMemo<'wrap' | undefined>(() => (local.wrap ? 'wrap' : undefined));

  return <Flex direction={flexDirection()} gap={gapValue()} wrap={wrapValue()} {...flexProps} />;
};
