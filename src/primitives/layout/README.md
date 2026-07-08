# Layout Primitives

A set of composable layout primitives for building UI layouts in HyperKit. These components use CSS-in-JS with CSS custom properties (design tokens) for consistent theming.

## Components

### Box

The foundational layout primitive. A polymorphic component that can render as any HTML element.

```tsx
import { Box } from '@ybouhjira/hyperkit';

// Basic usage
<Box p="lg" bg="secondary" borderRadius="md">
  Content
</Box>

// As a button
<Box as="button" px="xl" py="md" bg="accent" cursor="pointer">
  Click me
</Box>

// With positioning
<Box position="absolute" top={10} right={10}>
  Positioned
</Box>
```

**Props:**

- **Spacing**: `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl`, `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`
- **Sizing**: `w`, `h`, `minW`, `minH`, `maxW`, `maxH`
- **Appearance**: `bg`, `color`, `borderRadius`, `shadow`
- **Border**: `border`, `borderColor`, `borderBottom`, `borderTop`, `borderLeft`, `borderRight`
- **Position**: `position`, `top`, `right`, `bottom`, `left`, `inset`, `zIndex`
- **Display**: `overflow`, `display`
- **Interactive**: `hoverBg`, `hoverColor`, `cursor`, `transition`
- **Flex child**: `flex`, `alignSelf`
- **Polymorphic**: `as` (render as different HTML element)

### Flex

Extends Box with flexbox-specific props.

```tsx
import { Flex } from '@ybouhjira/hyperkit';

// Horizontal layout
<Flex gap="md" align="center" justify="between">
  <Box>Left</Box>
  <Box>Right</Box>
</Flex>

// Vertical layout
<Flex direction="column" gap="lg">
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Flex>

// Wrapping flex
<Flex wrap="wrap" gap="md">
  {items.map(item => <Box key={item}>{item}</Box>)}
</Flex>
```

**Additional Props:**

- `direction`: 'row' | 'column' | 'row-reverse' | 'column-reverse'
- `align`: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
- `justify`: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
- `gap`: SpaceToken
- `wrap`: 'nowrap' | 'wrap' | 'wrap-reverse'
- `inline`: boolean (renders as inline-flex)

### Stack

Opinionated wrapper around Flex for common stacking layouts. Defaults to vertical layout with medium gap.

```tsx
import { Stack } from '@ybouhjira/hyperkit';

// Vertical stack (default)
<Stack>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
  <Box>Item 3</Box>
</Stack>

// Horizontal stack
<Stack direction="horizontal" gap="xl">
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Stack>

// Custom gap
<Stack gap="xs">
  <Box>Tight spacing</Box>
  <Box>Between items</Box>
</Stack>
```

**Props:**

- `direction`: 'vertical' | 'horizontal' (default: 'vertical')
- `gap`: SpaceToken (default: 'md')
- All Flex/Box props

## Design Tokens

All components use CSS custom properties for theming. Available tokens:

### Space Tokens

`'0' | 'px' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'`

### Background Tokens

`'primary' | 'secondary' | 'tertiary' | 'elevated' | 'accent' | 'transparent'`

### Text Color Tokens

`'primary' | 'secondary' | 'muted' | 'on-accent'`

### Radius Tokens

`'sm' | 'md' | 'lg' | 'xl' | 'full'`

### Shadow Tokens

`'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner'`

### Z-Index Tokens

`'base' | 'dropdown' | 'sticky' | 'overlay' | 'modal' | 'popover' | 'tooltip' | 'toast'`

### Font Size Tokens

`'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'`

### Font Weight Tokens

`'regular' | 'medium' | 'semibold' | 'bold'`

## Utility Functions

You can also use the mapping functions directly:

```tsx
import { mapSpace, mapBg, mapTextColor, mapRadius } from '@ybouhjira/hyperkit';

const padding = mapSpace('lg'); // 'var(--sk-space-lg)'
const background = mapBg('accent'); // 'var(--sk-accent)'
const color = mapTextColor('on-accent'); // 'var(--sk-text-on-accent)'
const radius = mapRadius('md'); // 'var(--sk-radius-md)'
```

## Examples

### Card Layout

```tsx
<Box p="lg" bg="elevated" borderRadius="lg" shadow="md" border borderColor="subtle">
  <Stack gap="md">
    <Box color="primary" style={{ 'font-weight': 'bold' }}>
      Card Title
    </Box>
    <Box color="secondary">Card description text</Box>
    <Flex gap="sm" justify="end">
      <Box as="button" px="md" py="sm" borderRadius="sm">
        Cancel
      </Box>
      <Box as="button" px="md" py="sm" bg="accent" color="on-accent" borderRadius="sm">
        Submit
      </Box>
    </Flex>
  </Stack>
</Box>
```

### Form Layout

```tsx
<Stack p="xl" bg="secondary" borderRadius="lg" maxW={400}>
  <Box>
    <Box as="label" color="primary" mb="xs" display="block">
      Name
    </Box>
    <Box as="input" w="100%" p="sm" bg="primary" border borderRadius="sm" />
  </Box>
  <Box>
    <Box as="label" color="primary" mb="xs" display="block">
      Email
    </Box>
    <Box as="input" w="100%" p="sm" bg="primary" border borderRadius="sm" />
  </Box>
  <Stack direction="horizontal" justify="end" gap="sm">
    <Box as="button" px="lg" py="sm" bg="secondary" borderRadius="sm">
      Cancel
    </Box>
    <Box as="button" px="lg" py="sm" bg="accent" color="on-accent" borderRadius="sm">
      Submit
    </Box>
  </Stack>
</Stack>
```

### Header Layout

```tsx
<Flex
  as="header"
  align="center"
  justify="between"
  p="md"
  bg="elevated"
  borderBottom
  borderColor="subtle"
  position="sticky"
  top={0}
  zIndex="sticky"
>
  <Flex align="center" gap="md">
    <Box as="img" w={40} h={40} src="/logo.png" />
    <Box color="primary" style={{ 'font-weight': 'bold' }}>
      App Name
    </Box>
  </Flex>
  <Flex gap="md">
    <Box as="button" px="md" py="sm" cursor="pointer">
      About
    </Box>
    <Box
      as="button"
      px="md"
      py="sm"
      bg="accent"
      color="on-accent"
      borderRadius="sm"
      cursor="pointer"
    >
      Sign In
    </Box>
  </Flex>
</Flex>
```

### Sidebar + Main Layout

```tsx
<Flex h="100vh">
  <Box w={250} bg="secondary" borderRight borderColor="subtle" overflow="auto">
    <Stack p="md">{/* Sidebar content */}</Stack>
  </Box>
  <Box flex={1} bg="primary" overflow="auto">
    <Stack p="lg">{/* Main content */}</Stack>
  </Box>
</Flex>
```

## Architecture

- **No CSS files**: All styling is done via inline styles with CSS custom properties
- **Polymorphic**: Box can render as any HTML element via the `as` prop
- **Composable**: Flex extends Box, Stack extends Flex
- **Type-safe**: Full TypeScript support with token types
- **Theme-aware**: Uses CSS custom properties from ThemeProvider
- **Hover states**: Uses JS event handlers (onMouseEnter/onMouseLeave) for interactive styles
- **Minimal bundle**: Only includes what you use

## Pattern: Spacing Cascade

Spacing props follow a cascade pattern where more specific props override general ones:

```tsx
// p sets all sides
<Box p="md"> // padding: var(--sk-space-md)

// px/py override horizontal/vertical
<Box p="md" px="lg"> // padding: var(--sk-space-md) var(--sk-space-lg)

// Individual sides override everything
<Box p="md" px="lg" pl="xl"> // padding: var(--sk-space-md) var(--sk-space-lg) var(--sk-space-md) var(--sk-space-xl)
```

Same applies to margin (`m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`).
