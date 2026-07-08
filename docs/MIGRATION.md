# Migration Guide

This guide helps you upgrade between major versions of HyperKit.

## Upgrading from v1.x to v2.x

### Breaking Changes

#### ThemeProvider API changes

The theme configuration structure was updated in v2.x to support more granular token control and viewport-adaptive typography.

**Before (v1.x):**

```tsx
<ThemeProvider theme={{ primaryColor: '#e94560' }}>
```

**After (v2.x):**

```tsx
<ThemeProvider config={{
  colors: { accent: '#e94560' },
  // ... other config
}}>
```

**Migration steps:**

1. Rename `theme` prop → `config`
2. Use the new theme structure (see [ThemeProvider docs](../src/theme/))
3. Consider using one of the 22 built-in theme presets instead

---

#### Component renames

| Old Name           | New Name   | Status                  | Notes                                            |
| ------------------ | ---------- | ----------------------- | ------------------------------------------------ |
| `MarkdownRenderer` | `Markdown` | Deprecated alias exists | Old name still works but will be removed in v3.x |

**Migration:**

```tsx
// Before
import { MarkdownRenderer } from '@ybouhjira/hyperkit';

// After
import { Markdown } from '@ybouhjira/hyperkit';
```

---

#### CSS Variable prefix standardization

All CSS variables now use the `--sk-` prefix consistently for better namespacing and collision avoidance.

**Before (v1.x):**

```css
--hyperkit-bg: ...;
--hyperkit-fg: ...;
```

**After (v2.x):**

```css
--sk-bg: ...;
--sk-fg: ...;
```

**Migration steps:**

1. Search your CSS/SCSS files for `--hyperkit-`
2. Replace all instances with `--sk-`
3. Check the [CSS Variables reference](CSS_VARIABLES.md) for the complete list

---

### New Features in v2.x

You can adopt these gradually — they're fully backwards compatible:

- **Token-based spacing system**: Use `SpaceToken` values (`'xs'`, `'sm'`, `'md'`, etc.) instead of raw pixel values

  ```tsx
  <Box padding="md" gap="lg"> {/* Instead of padding="16px" */}
  ```

- **22 built-in theme presets**: Pre-configured themes inspired by popular code editors

  ```tsx
  import { themePresets } from '@ybouhjira/hyperkit';
  <ThemeProvider config={themePresets.oneDarkPro}>
  ```

- **Effect-TS service integration**: First-class Effect services for WebSocket, Session, FileSystem, Clipboard

  ```tsx
  import { WebSocketService } from '@ybouhjira/hyperkit/effects';
  ```

- **CSS variable audit tooling**: Use the CLI to list all available tokens
  ```bash
  npx hyperkit tokens
  ```

---

## Upgrading from v2.x to v3.x (Future)

_No breaking changes planned yet. This section will be updated when v3.0 is released._

**Planned deprecations:**

- `MarkdownRenderer` alias will be removed (use `Markdown` directly)

---

## General Upgrade Steps

Follow this checklist when upgrading to any new major version:

1. **Update the package:**

   ```bash
   npm install @ybouhjira/hyperkit@latest
   ```

2. **Check peer dependencies:**

   ```bash
   npm ls solid-js @kobalte/core effect
   ```

   Ensure they match the [required versions](../package.json#peerDependencies).

3. **Run TypeScript checks:**

   ```bash
   npx tsc --noEmit
   ```

   Catch any type errors from API changes.

4. **Search for deprecated APIs:**

   ```bash
   # Find deprecated imports in your code
   grep -r "MarkdownRenderer" src/

   # Check node_modules for deprecation warnings
   grep -r "@deprecated" node_modules/@ybouhjira/hyperkit/dist/
   ```

5. **Run your test suite:**

   ```bash
   npm test
   ```

6. **Visual regression testing:**
   - Manually inspect key pages
   - Run Playwright/Storybook visual tests if available

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/ybouhjira/hyperkit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ybouhjira/hyperkit/discussions)
- **CSS Reference**: [CSS_VARIABLES.md](CSS_VARIABLES.md)
- **SSR Guide**: [SSR.md](SSR.md)

---

## Version History

| Version    | Release Date | Notable Changes                            |
| ---------- | ------------ | ------------------------------------------ |
| **v2.5.0** | 2025-03      | Current stable release                     |
| **v2.0.0** | 2024-xx      | Theme system overhaul, token-based spacing |
| **v1.x**   | 2023-xx      | Initial release                            |
