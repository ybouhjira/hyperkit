import { Component, JSX, splitProps } from 'solid-js';
import { Box, BoxProps } from '../Box';
import { SpaceToken, mapSpace } from '../layout';

export interface FlexProps extends BoxProps {
  /** Flex direction. Controls main axis orientation. */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  /** Align items along cross axis. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Justify content along main axis. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Gap between flex children. Uses spacing token. */
  gap?: SpaceToken;
  /** Flex wrap behavior.
   * @default 'nowrap' */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** Use inline-flex instead of flex display.
   * @default false */
  inline?: boolean;
}

/**
 * Flexbox layout primitive extending Box. Provides convenient props for flex direction, alignment, justification, and gap.
 *
 * @example
 * ```tsx
 * import { Flex, Button, Text } from "@ybouhjira/hyperkit";
 *
 * // Toolbar with space-between alignment
 * <Flex justify="between" align="center" gap="sm">
 *   <Text size="lg" weight="semibold">Dashboard</Text>
 *   <Flex gap="xs">
 *     <Button variant="ghost" size="sm">Export</Button>
 *     <Button size="sm">New Project</Button>
 *   </Flex>
 * </Flex>
 *
 * // Centered card layout
 * <Flex direction="column" align="center" gap="md" style={{ "min-height": "100vh" }}>
 *   <Text as="h1" size="xl">Welcome back</Text>
 *   <Button>Continue</Button>
 * </Flex>
 *
 * // Wrapping tag row
 * <Flex wrap="wrap" gap="xs">
 *   <For each={tags}>{(tag) => <Badge>{tag}</Badge>}</For>
 * </Flex>
 * ```
 *
 * @see Stack - for simplified vertical/horizontal stacking
 * @see Grid - for two-dimensional layouts
 */
export const Flex: Component<FlexProps> = (props) => {
  const [local, boxProps] = splitProps(props, [
    'direction',
    'align',
    'justify',
    'gap',
    'wrap',
    'inline',
    'style',
  ]);

  const computedFlexStyle = (): JSX.CSSProperties => {
    const style: JSX.CSSProperties = { ...local.style };

    if (local.direction) {
      style['flex-direction'] = local.direction;
    }

    if (local.align) {
      style['align-items'] =
        local.align === 'start' ? 'flex-start' : local.align === 'end' ? 'flex-end' : local.align;
    }

    if (local.justify) {
      const justifyValue =
        local.justify === 'start'
          ? 'flex-start'
          : local.justify === 'end'
            ? 'flex-end'
            : local.justify === 'between'
              ? 'space-between'
              : local.justify === 'around'
                ? 'space-around'
                : local.justify === 'evenly'
                  ? 'space-evenly'
                  : local.justify;
      style['justify-content'] = justifyValue;
    }

    if (local.gap) {
      style.gap = mapSpace(local.gap);
    }

    if (local.wrap) {
      style['flex-wrap'] = local.wrap;
    }

    return style;
  };

  return (
    <Box
      display={local.inline ? 'inline-flex' : 'flex'}
      style={computedFlexStyle()}
      {...boxProps}
    />
  );
};
