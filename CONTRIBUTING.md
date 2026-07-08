# Contributing to HyperKit

Thank you for your interest in contributing to HyperKit! This guide will help you get started.

## Prerequisites

- **Node.js**: >= 20.0.0
- **Package Manager**: pnpm (`corepack enable` or `npm i -g pnpm`)
- **Git**: For version control

## Getting Started

1. **Fork the repository** on GitHub

2. **Clone your fork**:

   ```bash
   git clone https://github.com/your-username/hyperkit.git
   cd hyperkit
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

4. **Start the development environment**:
   ```bash
   cd packages/explorer && pnpm dev
   ```
   This opens the Explorer at `http://localhost:6007` where you can see all components and develop in isolation.

## Development Workflow

1. **Use Storybook** as your primary development environment for iterating on components
2. **Write tests** alongside your component implementation
3. **Run quality checks** frequently to catch issues early
4. **Commit often** with clear, descriptive messages

### Available Commands

```bash
npm run dev              # Vite dev server
cd packages/explorer && pnpm dev   # component explorer (port 6007)
npm run build            # TypeScript + Vite build to dist/
npm run test             # Run all tests (vitest)
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run quality          # Full quality check (format + lint + CSS lint + test + build + publint + attw + size + knip)
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run lint:css         # Stylelint CSS
npm run format           # Prettier format
npm run format:check     # Prettier check
```

## Project Structure

```
src/
├── primitives/      # Base components (Box, Button, Text, Card, etc.)
│   └── layout/      # Layout tokens, types, utils (SpaceToken, etc.)
├── composites/      # Complex composed components
├── animation/       # Transition, ScrollReveal
├── theme/           # ThemeProvider, types, defaults, presets
├── hooks/           # Custom hooks
├── keyboard/        # Keyboard shortcuts system
├── panels/          # Panel layout system
├── layouts/         # Layout components
├── icons/           # Icon components
├── tokens/          # Design tokens
├── utils/           # Utility functions
├── views/           # View components
├── effects/         # Side effects
├── types/           # TypeScript types
└── index.ts         # All exports
```

## Adding a New Component

### Step 1: Create Component Directory

For primitive components:

```bash
mkdir -p src/primitives/MyComponent
```

For composite components:

```bash
mkdir -p src/composites/MyComponent
```

### Step 2: Create Component Files

Create the following files in your component directory:

**`MyComponent.tsx`** - Component implementation:

```tsx
import { Component } from 'solid-js';
import './MyComponent.css';

export interface MyComponentProps {
  children?: JSX.Element;
  class?: string;
  // Add your props here
}

export const MyComponent: Component<MyComponentProps> = (props) => {
  return <div class={`sk-my-component ${props.class || ''}`}>{props.children}</div>;
};
```

**`MyComponent.css`** - Styles:

```css
.sk-my-component {
  /* Use CSS variables for customization */
  padding: var(--sk-my-component-padding, var(--sk-space-md));
  background: var(--sk-my-component-bg, var(--sk-color-surface));
}

/* BEM modifiers */
.sk-my-component--variant {
  /* ... */
}

.sk-my-component__element {
  /* ... */
}
```

**`MyComponent.stories.tsx`** - Storybook stories:

```tsx
import type { Meta, StoryObj } from 'storybook-solidjs';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Primitives/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'My Component Content',
  },
};
```

**`MyComponent.test.tsx`** - Tests:

```tsx
import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders children correctly', () => {
    const { getByText } = render(() => <MyComponent>Hello</MyComponent>);
    expect(getByText('Hello')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <MyComponent class="custom">Content</MyComponent>);
    expect(container.querySelector('.custom')).toBeInTheDocument();
  });
});
```

**`index.ts`** - Barrel export:

```tsx
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

### Step 3: Add to Main Export

Add your component to `src/primitives/index.ts` or `src/composites/index.ts`:

```tsx
export * from './MyComponent';
```

### Step 4: Test Your Component

1. View in the Explorer: `cd packages/explorer && pnpm dev`
2. Run tests: `npm test`
3. Run full quality check: `npm run quality`

## Code Standards

### TypeScript

- **Strict mode** enabled - no implicit `any`
- **No `any` types** - use proper typing or `unknown` with type guards
- **Props interfaces** named `{Component}Props`
- **Export all types** from component barrel exports

### ESLint & Prettier

- Code is automatically formatted with Prettier
- ESLint enforces code quality rules
- Run `npm run lint:fix` to auto-fix issues
- Run `npm run format` to format code

### Stylelint

- CSS follows BEM naming convention
- Stylelint enforces CSS quality rules
- Run `npm run lint:css` to check CSS

## CSS Conventions

### BEM Naming

Use Block-Element-Modifier (BEM) naming:

```css
/* Block */
.sk-button {
}

/* Element */
.sk-button__icon {
}

/* Modifier */
.sk-button--primary {
}
.sk-button--disabled {
}
```

### CSS Variables Format

All components expose CSS variables for customization:

```css
/* Component-specific variables */
--sk-{component}-{property}

/* Examples */
--sk-button-padding
--sk-button-bg
--sk-button-color
--sk-card-border-radius
```

### Token Usage

Prefer design tokens over raw values:

```tsx
// ✅ Good - using SpaceToken
<Box padding="md" gap="lg" />

// ❌ Bad - using raw values
<Box padding="16px" gap="24px" />
```

Common token types:

- **SpaceToken**: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, etc.
- **ColorToken**: Theme color names
- **SizeToken**: Predefined sizes

## Testing

### Testing Stack

- **Vitest** - Test runner
- **@solidjs/testing-library** - Component testing utilities

### Minimum Test Coverage

Every component should have tests for:

1. **Rendering** - Component renders without crashing
2. **Props** - Props are applied correctly
3. **Edge Cases** - Empty states, undefined props, etc.
4. **Interactions** - Click handlers, keyboard events (if applicable)

### Example Test Structure

```tsx
import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { container } = render(() => <MyComponent />);
    expect(container.querySelector('.sk-my-component')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    const { getByRole } = render(() => <MyComponent onClick={onClick} />);
    fireEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

## Commit Convention

Use semantic commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **refactor**: Code refactoring (no functional change)
- **docs**: Documentation changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build config, etc.)

### Examples

```bash
feat(Button): add size variants
fix(Card): correct padding calculation
refactor(theme): simplify color token resolution
docs(README): update installation instructions
test(Box): add polymorphic rendering tests
chore: bump dependencies
```

### Scope

The scope is usually the component name or affected area (e.g., `Button`, `theme`, `build`).

## Quality Checks

Before submitting a PR, run the full quality check:

```bash
npm run quality
```

This command runs:

1. **Prettier** - Code formatting check
2. **ESLint** - JavaScript/TypeScript linting
3. **Stylelint** - CSS linting
4. **Vitest** - All tests
5. **Build** - TypeScript compilation + Vite build
6. **Publint** - Validates package.json for npm publishing
7. **ATTW** - Are The Types Wrong check (validates TypeScript exports)
8. **Size** - Bundle size limits check (dist/index.js ≤ 250 kB, dist/index.css ≤ 30 kB)
9. **Knip** - Finds unused exports and dependencies

All checks must pass before your PR can be merged.

## Pull Request Process

### 1. Create a Feature Branch

Branch naming convention:

```bash
# Features
git checkout -b feat/my-new-component

# Bug fixes
git checkout -b fix/button-click-issue

# Documentation
git checkout -b docs/update-readme

# Refactoring
git checkout -b refactor/simplify-theme
```

### 2. Make Your Changes

- Write clean, well-documented code
- Add tests for new functionality
- Update Storybook stories if needed
- Run `npm run quality` to ensure all checks pass

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat(MyComponent): add new component with variants"
```

### 4. Push to Your Fork

```bash
git push -u origin feat/my-new-component
```

### 5. Create a Pull Request

Go to GitHub and create a PR with this template:

```markdown
## Summary

- Brief description of changes
- List key additions/modifications

## Test plan

- [ ] All tests pass (`npm test`)
- [ ] Quality checks pass (`npm run quality`)
- [ ] Storybook stories added/updated
- [ ] Component renders correctly in Storybook
- [ ] Manual testing completed

Closes #[issue-number]
```

### 6. PR Requirements

Your PR must:

- ✅ Pass all CI checks
- ✅ Include tests for new functionality
- ✅ Have clear commit messages
- ✅ Update documentation if needed
- ✅ Follow the project's code standards
- ✅ Be reviewed and approved by a maintainer

## Questions?

If you have questions or need help:

- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review the project's `CLAUDE.md` for AI-assisted development patterns

Thank you for contributing to HyperKit! 🎉
