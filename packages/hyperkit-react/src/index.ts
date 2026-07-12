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
export { Box } from './primitives/Box/Box';
export type { BoxProps } from './primitives/Box/Box';
export { Grid } from './primitives/Grid/Grid';
export type { GridProps } from './primitives/Grid/Grid';
export { Badge } from './primitives/Badge/Badge';
export type { BadgeProps } from './primitives/Badge/Badge';
export { Spinner } from './primitives/Spinner/Spinner';
export type { SpinnerProps } from './primitives/Spinner/Spinner';
export { Skeleton } from './primitives/Skeleton/Skeleton';
export type { SkeletonProps } from './primitives/Skeleton/Skeleton';
export { ProgressBar } from './primitives/ProgressBar/ProgressBar';
export type { ProgressBarProps } from './primitives/ProgressBar/ProgressBar';
export { Separator } from './primitives/Separator/Separator';
export type { SeparatorProps } from './primitives/Separator/Separator';
export { Input } from './primitives/Input/Input';
export type { InputProps } from './primitives/Input/Input';
export { Checkbox } from './primitives/Checkbox/Checkbox';
export type { CheckboxProps } from './primitives/Checkbox/Checkbox';
export { Switch } from './primitives/Switch/Switch';
export type { SwitchProps } from './primitives/Switch/Switch';
export { Tabs } from './primitives/Tabs/Tabs';
export type { TabsProps, TabItem } from './primitives/Tabs/Tabs';
export { Dialog } from './primitives/Dialog/Dialog';
export type { DialogProps } from './primitives/Dialog/Dialog';
export { Tooltip } from './primitives/Tooltip/Tooltip';
export type { TooltipProps } from './primitives/Tooltip/Tooltip';
export { Select } from './primitives/Select/Select';
export type { SelectProps, SelectOption } from './primitives/Select/Select';
export { Table } from './primitives/Table/Table';
export type { TableProps, TableColumn } from './primitives/Table/Table';
