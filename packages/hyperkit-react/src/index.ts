// Theme system (React bindings over the shared @ybouhjira/hyperkit-styles engine)
export { ThemeProvider, useTheme } from './theme/ThemeProvider';
export type { ThemeProviderProps, ThemeContextValue } from './theme/ThemeProvider';

// Re-export the framework-agnostic theme core so apps import one package.
export {
  themePresets,
  applyThemeToDOM,
  applyThemeToElement,
  serializeThemeVars,
  fjordTheme,
  hyperlabsTheme,
} from '@ybouhjira/hyperkit-styles';
export type { ThemeConfig, ThemeColors, ThemeFonts, ThemeRadius } from '@ybouhjira/hyperkit-styles';

// Primitives
export { Button } from './primitives/Button/Button';
export type { ButtonProps } from './primitives/Button/Button';
export { Text } from './primitives/Text/Text';
export type { TextProps } from './primitives/Text/Text';
export { Card } from './primitives/Card/Card';
export type { CardProps } from './primitives/Card/Card';
export { Flex } from './primitives/Flex/Flex';
export type { FlexProps } from './primitives/Flex/Flex';
export { Stack } from './primitives/Stack/Stack';
export type { StackProps } from './primitives/Stack/Stack';
