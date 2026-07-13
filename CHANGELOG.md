# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 3.5.1

### Fixed

- `@ybouhjira/hyperkit-styles` 0.1.0 emitted extensionless relative imports in its ESM dist, which bare Node (no bundler) could not resolve. Source imports now carry explicit `.js` extensions; all three packages republished (`hyperkit-styles` 0.1.1, `hyperkit-react` 0.1.1, `hyperkit` 3.5.1) with the styles dependency widened to a caret range.

## 3.5.0

### Added

- **React support (Phase 1)** — new sibling packages sharing one design-system core:
  - `@ybouhjira/hyperkit-styles` — the framework-agnostic core: all component stylesheets, `--sk-*` tokens, `ThemeConfig` types, 40 theme presets, the theme engine (`applyThemeToDOM`, `applyThemeToElement`, `serializeThemeVars`), and token mappers.
  - `@ybouhjira/hyperkit-react` — React 18/19 components rendering the identical `sk-*` DOM contract from the same stylesheets: `ThemeProvider`/`useTheme` plus Button, Text, Card, Flex, Stack, Box, Grid, Badge, Spinner, Skeleton, ProgressBar, Separator, Input, Checkbox, Switch, Tabs, Dialog, Tooltip, Select, and Table (Radix UI backs the a11y-heavy set).

### Changed

- The SolidJS package now consumes its CSS and theme core from `@ybouhjira/hyperkit-styles` (new dependency). All public import paths and the shipped `dist/index.css` are unchanged — this is internal restructuring; themes, class names, and tokens are byte-compatible.

## 3.4.3

### Fixed

- **SSR hydration crashes** on prerendered pages (`TypeError: template2 is not a function`). Two root-cause classes, both fixed across the whole component set:
  - Lazy `@kobalte/core`-backed components branched on `isServer`, so the server and the client's hydration pass rendered different trees. `Select`, `Slider`, `RangeSlider`, `NumberInput`, `Dropdown`, and `Popover` now mount-gate (render the native fallback until `onMount`, then swap in the enhanced control) — server and hydration render the same tree.
  - Components that read an element-typed prop more than once (in a `Show when` guard and again as content) created the element twice, corrupting hydration keys. `Sidebar` (`header`/`footer`), `MetricCard` (`icon`), and `Table` (`emptyState`) now resolve those props once via Solid's `children()`.

These only affected consumers rendering the components on a prerendered/SSR page; client-only usage was unaffected.

## 3.4.2

### Fixed

- 52 CSS references to nonexistent tokens (`--sk-transition-*`, `--sk-font-size-md`, `--sk-accent-subtle`, `--sk-color-*`, …) silently resolved to nothing across 22 components — borders, hover washes, and transitions now render
- `Table` row selection no longer goes stale (reactivity bug); hover moved from DOM mutation to CSS
- `IssueBoard` GitHub label colors with `#`-prefix produced invalid CSS
- `SessionManager` subagent tree alignment (monospace + preserved whitespace)
- `ColorInput` focus/alpha styling referenced an undefined token

### Changed

- Inline-style-era components migrated to co-located token-driven stylesheets: Table, Text, TopProgressBar, DocumentPage, Drawer, BottomSheet, MobileBottomBar, IssueBoard, SessionManager, SettingsPanel, Inspector, FontSelect, ThemeAuditor, ThemePicker, ThemeBuilder, Panel, ReportScoreCard — themes now apply to every component
- New `fjord` theme preset (40 total)
- Design-token lint rules (`eslint-plugin-hyperkit`) now enforced on the library's own source; `audit:css-vars` validates that component-scoped vars carry fallbacks or definitions
- Size budgets rebalanced: JS 355 kB (was 360), CSS 45 kB (styles moved from JS to CSS)

## [3.0.0] - 2026-04-13

### Removed (BREAKING)

- `ExamBuilder` composite and all exports: `ExamDocument`, `ExerciseRenderer`, `FillBlankExercise`, `MatchingExercise`, `MCQExercise`, `TrueFalseExercise`, `FreeTextExercise`, and associated types (`Exam`, `Exercise`, `ExerciseType`, `Question`, `MatchAnswer`). Domain-specific business logic does not belong in a generic UI framework — exam/exercise rendering is now owned by consuming apps.
- `packages/exam-generator` — demo app removed from the monorepo. Preserved at https://github.com/ybouhjira/solidkit-exam-generator.

### Migration

Apps that imported exam components from `@ybouhjira/hyperkit` must now implement their own domain layer using generic primitives (`DocumentPage`, `Table`, `Stack`, `Text`, `Badge`, etc.).

## [2.5.0] - 2026-03-06

### Added

- New primitive components: MediaGrid, MarkdownRenderer, StreamingText, TerminalOutput
- GuidedTour composite component with task-based guided tour functionality
- HyperKit CLI for theme generation and token management
- ThemeBuilder and Storybook MCP evaluation tools
- MCP (Model Context Protocol) server for AI coding assistant integration
- Per-component AI documentation in `/docs/ai/` directory
- Comprehensive AI docs generator script
- ISC LICENSE file

### Changed

- Reorganized exports with category barrel files for better tree-shaking
- Added `sideEffects` field to package.json for improved tree-shaking
- Updated Knip configuration
- Enhanced README with CLI documentation

### Fixed

- MenuBar now uses Kobalte Menubar primitive instead of DropdownMenu
- Replaced invalid BEM nesting with flat CSS selectors
- Resolved CSS formatting issues

## [2.4.0] - 2026-02-28

### Added

- New primitive components: VideoInput, AudioInput, DateInput, RangeSlider, TagInput, ColorInput, FileInput, Slider, NumberInput, DropZone, ImageInput, Accordion, Section, Separator, Spinner, Switch, ConfirmDialog
- MediaTrimmer component for media editing
- AnimateOnScroll component for scroll-triggered animations
- Report module with visual regression testing
- Five new theme presets (Dracula, Nord, Tokyo Night, Solarized, Material)
- useVideoPreview hook for video preview functionality
- Comprehensive CSS variables documentation (`/docs/CSS_VARIABLES.md`)
- AI documentation files (`/llms.txt`, `/llms-full.txt`)
- Visual regression testing with Playwright
- `unstyled` and `classNames` props for all components
- Library design principles documentation

### Changed

- Migrated Card component from inline styles to CSS file
- Replaced numeric spacing tokens with semantic-only API
- Extended design token system for zero-CSS composition
- Improved component props and types consistency
- Enhanced component API with splitProps pattern

### Fixed

- Addressed stylelint, test, and build errors
- Resolved TypeScript strict mode violations
- Removed all explicit `any` types from codebase
- Removed all eslint-disable comments
- Fixed invalid `--sk-space-smxl` tokens, replaced with `--sk-space-2xl`
- Removed unimplemented exports

## [2.3.0] - 2026-02-15

### Added

- Haptic feedback system (`useHaptic`, `createHaptic`) for mobile vibration patterns
- Notification sounds (`useNotificationSound`, `createNotificationSound`) with Web Audio API
- Settings panel components (`SettingsPanel`, `AppearancePanel`, `AnimationPanel`, `LayoutPanel`) with `createSettingsStore`
- Gallery-hub full app mockup in Storybook
- Interaction tests for Kobalte-based components
- Themable spacing and z-index tokens via ThemeProvider
- Layout primitives (Box, Flex, Stack, Grid, Text, Center)

### Changed

- Hardened TypeScript strict mode with `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Added ESLint type-checked rules (`no-floating-promises`, `strict-boolean-expressions`, `require-await`)
- Improved theme accent color handling
- Enhanced universal scrollbar selectors
- Better native form element styling

### Fixed

- Post-merge test failures and formatting issues
- SessionSearch XSS vulnerability by replacing innerHTML with JSX rendering
- ModeSwitcher timer cleanup on rapid mode switches
- ThemePickerModal keyboard listener gating by open state
- ErrorBanner proper timer cleanup
- MobileNav CSS token usage and animation prefixing

### Infrastructure

- Added Husky + lint-staged for pre-commit hooks
- Added Stylelint with BEM validation
- Added Knip for unused exports detection
- Added publint for package.json validation
- Added @arethetypeswrong/cli (attw) for TypeScript types validation
- Added size-limit for bundle size monitoring
- Added Changesets for release management
- Updated CI pipelines with comprehensive quality checks
