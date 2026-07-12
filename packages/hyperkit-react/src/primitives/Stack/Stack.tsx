import { Flex, type FlexProps } from '../Flex/Flex';

export interface StackProps extends Omit<FlexProps, 'direction' | 'wrap'> {
  /** Stack direction.
   * @default 'vertical' */
  direction?: 'vertical' | 'horizontal';
}

/**
 * Convenience wrapper for Flex with simplified direction API — stacks children
 * vertically (default) or horizontally with a default 'md' gap.
 */
export function Stack({ direction = 'vertical', gap = 'md', ...rest }: StackProps) {
  return <Flex direction={direction === 'horizontal' ? 'row' : 'column'} gap={gap} {...rest} />;
}
