# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
