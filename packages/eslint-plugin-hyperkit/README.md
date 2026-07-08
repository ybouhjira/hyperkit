# @ybouhjira/eslint-plugin-hyperkit

ESLint plugin for HyperKit component library - enforce HyperKit best practices and theme usage.

## Installation

```bash
pnpm add -D @ybouhjira/eslint-plugin-hyperkit
```

## Usage

Add to your ESLint configuration:

```js
import hyperkit from '@ybouhjira/eslint-plugin-hyperkit';

export default [
  {
    plugins: {
      hyperkit,
    },
    rules: {
      'hyperkit/no-hardcoded-colors': 'error',
      'hyperkit/no-hardcoded-font-size': 'error',
      'hyperkit/no-hardcoded-spacing': 'warn',
      'hyperkit/no-important': 'error',
      'hyperkit/require-keyed-show': 'error',
      'hyperkit/no-props-assign-outside-jsx': 'error',
    },
  },
];
```

## Rules

### `no-hardcoded-colors`

Detects hardcoded color values in JSX inline styles and suggests using HyperKit theme variables.

**Invalid:**

```tsx
<div style={{ color: '#fff' }} />
<div style={{ backgroundColor: 'rgb(255, 0, 0)' }} />
<div style={{ borderColor: 'red' }} />
```

**Valid:**

```tsx
<div style={{ color: 'var(--sk-text-primary)' }} />
<div style={{ backgroundColor: 'transparent' }} />
<div style={{ color: 'inherit' }} />
```

### `no-hardcoded-font-size`

Detects hardcoded font sizes in JSX inline styles and suggests using HyperKit theme variables.

**Invalid:**

```tsx
<div style={{ fontSize: '14px' }} />
<div style={{ fontSize: '1.2rem' }} />
```

**Valid:**

```tsx
<div style={{ fontSize: 'var(--sk-font-size-base)' }} />
<div style={{ fontSize: 'inherit' }} />
```

**Suggestions:**

- `12px` → `var(--sk-font-size-xs)`
- `14px` → `var(--sk-font-size-sm)`
- `16px` → `var(--sk-font-size-base)`
- `18px` → `var(--sk-font-size-lg)`
- `20px` → `var(--sk-font-size-xl)`
- `24px` → `var(--sk-font-size-2xl)`

### `no-hardcoded-spacing`

Detects hardcoded spacing values in JSX inline styles (severity: `warn` by default).

**Invalid:**

```tsx
<div style={{ padding: '16px' }} />
<div style={{ margin: '8px 16px' }} />
<div style={{ gap: '1rem' }} />
```

**Valid:**

```tsx
<div style={{ padding: 'var(--sk-space-md)' }} />
<div style={{ margin: '0' }} />
<div style={{ padding: 'auto' }} />
```

### `no-important`

Detects `!important` in inline style values.

**Invalid:**

```tsx
<div style={{ color: 'red !important' }} />
<div style={{ display: 'none !important' }} />
```

**Valid:**

```tsx
<div style={{ color: 'var(--sk-text-primary)' }} />
```

### `require-keyed-show`

Detects `<Show>` components with render callback children but without `keyed` prop.

**Invalid:**

```tsx
<Show when={condition()}>{(item) => <div>{item}</div>}</Show>
<Show when={data()}>{(d) => <span>{d.name}</span>}</Show>
```

**Valid:**

```tsx
<Show when={condition()} keyed>{(item) => <div>{item}</div>}</Show>
<Show when={isVisible()}><div>Static content</div></Show>
```

### `no-props-assign-outside-jsx`

Detects assigning `props.x` to a const/let/var outside of a reactive scope, which breaks SolidJS reactivity.

**Invalid:**

```tsx
function Comp(props) {
  const x = props.foo;
  return <div />;
}

function Comp(props) {
  const x = props.foo || props.bar;
  return <div />;
}

function Comp(props) {
  const { foo, bar } = props;
  return <div />;
}
```

**Valid:**

```tsx
function Comp(props) {
  const x = () => props.foo;
  return <div />;
}

function Comp(props) {
  return <div>{props.foo}</div>;
}

function Comp(props) {
  createMemo(() => props.foo);
  return <div />;
}
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Watch mode
pnpm test:watch
```

## License

ISC
