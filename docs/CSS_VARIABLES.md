# HyperKit CSS Variables Reference

Complete reference for all CSS variables and class names in the HyperKit component library.

## Table of Contents

- [Design Tokens](#design-tokens)
- [Global Styles](#global-styles)
- [Primitives](#primitives)
  - [Accordion](#accordion)
  - [Badge](#badge)
  - [Button](#button)
  - [Card](#card)
  - [Code Block](#code-block)
  - [Collapsible](#collapsible)
  - [Dialog](#dialog)
  - [Dropdown](#dropdown)
  - [Empty State](#empty-state)
  - [Icon](#icon)
  - [Input](#input)
  - [Kbd](#kbd)
  - [Progress Bar](#progress-bar)
  - [Progress Ring](#progress-ring)
  - [Project Card](#project-card)
  - [ScrollArea](#scrollarea)
  - [Search Input](#search-input)
  - [Select](#select)
  - [Separator](#separator)
  - [Skeleton](#skeleton)
  - [Slider](#slider)
  - [Spinner](#spinner)
  - [Switch](#switch)
  - [Tabs](#tabs)
  - [Timeline](#timeline)
  - [Tooltip](#tooltip)
- [Composites](#composites)
  - [Confirm Dialog](#confirm-dialog)
  - [Toast](#toast)

---

## Design Tokens

### CSS Variables

| Variable                | Default                             | Description                  |
| ----------------------- | ----------------------------------- | ---------------------------- |
| `--sk-height-xs`        | `24px`                              | Extra small component height |
| `--sk-height-sm`        | `28px`                              | Small component height       |
| `--sk-height-md`        | `32px`                              | Medium component height      |
| `--sk-height-lg`        | `40px`                              | Large component height       |
| `--sk-height-xl`        | `48px`                              | Extra large component height |
| `--sk-duration-instant` | `50ms`                              | Instant transition duration  |
| `--sk-duration-fast`    | `150ms`                             | Fast transition duration     |
| `--sk-duration-normal`  | `200ms`                             | Normal transition duration   |
| `--sk-duration-slow`    | `300ms`                             | Slow transition duration     |
| `--sk-duration-slower`  | `500ms`                             | Slower transition duration   |
| `--sk-duration-spin`    | `1s`                                | Spin animation duration      |
| `--sk-duration-pulse`   | `2s`                                | Pulse animation duration     |
| `--sk-duration-bounce`  | `1s`                                | Bounce animation duration    |
| `--sk-ease-default`     | `cubic-bezier(0.4, 0, 0.2, 1)`      | Default easing function      |
| `--sk-ease-in`          | `cubic-bezier(0.4, 0, 1, 1)`        | Ease-in function             |
| `--sk-ease-out`         | `cubic-bezier(0, 0, 0.2, 1)`        | Ease-out function            |
| `--sk-ease-in-out`      | `cubic-bezier(0.4, 0, 0.6, 1)`      | Ease-in-out function         |
| `--sk-ease-bounce`      | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bounce easing function       |
| `--sk-leading-none`     | `1`                                 | No line height               |
| `--sk-leading-tight`    | `1.25`                              | Tight line height            |
| `--sk-leading-snug`     | `1.375`                             | Snug line height             |
| `--sk-leading-normal`   | `1.5`                               | Normal line height           |
| `--sk-leading-relaxed`  | `1.75`                              | Relaxed line height          |
| `--sk-leading-loose`    | `2`                                 | Loose line height            |
| `--sk-border-width`     | `1px`                               | Default border width         |
| `--sk-border-width-2`   | `2px`                               | Medium border width          |
| `--sk-border-width-4`   | `4px`                               | Large border width           |
| `--sk-icon-xs`          | `12px`                              | Extra small icon size        |
| `--sk-icon-sm`          | `14px`                              | Small icon size              |
| `--sk-icon-md`          | `16px`                              | Medium icon size             |
| `--sk-icon-lg`          | `20px`                              | Large icon size              |
| `--sk-icon-xl`          | `24px`                              | Extra large icon size        |

### Keyframe Animations

- `sk-spin` - 360° rotation animation
- `sk-fade-in` - Fade in with slight upward movement
- `sk-ping` - Scale and fade out ping effect
- `sk-pulse` - Opacity pulsing animation

---

## Global Styles

### CSS Variables

| Variable                         | Default                | Description                   |
| -------------------------------- | ---------------------- | ----------------------------- |
| `--sk-focus-width`               | `2px`                  | Focus outline width           |
| `--sk-focus-style`               | `solid`                | Focus outline style           |
| `--sk-focus-color`               | `var(--sk-accent)`     | Focus outline color           |
| `--sk-focus-offset`              | `-1px`                 | Focus outline offset          |
| `--sk-scroll-width`              | `10px`                 | Scrollbar width               |
| `--sk-scroll-track`              | `transparent`          | Scrollbar track color         |
| `--sk-scroll-thumb`              | `var(--sk-border)`     | Scrollbar thumb color         |
| `--sk-scroll-thumb-hover`        | `var(--sk-text-muted)` | Scrollbar thumb hover color   |
| `--sk-scroll-thumb-radius`       | `5px`                  | Scrollbar thumb border radius |
| `--sk-prose-blockquote-border-w` | `3px`                  | Blockquote border width       |

### Utility Classes

| Class          | Description                              |
| -------------- | ---------------------------------------- |
| `.sk-sr-only`  | Screen reader only (visually hidden)     |
| `.sk-truncate` | Text truncation with ellipsis            |
| `.sk-prose`    | Prose/typography styles for rich content |

### Global Keyframe Animations

- `sk-spin` - 360° rotation
- `sk-pulse` - Opacity pulse
- `sk-bounce` - Vertical bounce
- `sk-fade-in` - Fade in from transparent
- `sk-zoom-in` - Scale up from 0.95 to 1
- `sk-slide-up` - Slide up from 10px below
- `sk-slide-down` - Slide down from 10px above
- `sk-float` - Floating animation with translation and scale
- `sk-fade-in-up` - Fade in while sliding up 30px
- `sk-scale-in` - Scale in from 0.9
- `sk-line-grow` - Width expansion to 100%

---

## Primitives

### Accordion

**File:** `src/primitives/Accordion/Accordion.css`

#### CSS Variables

| Variable                          | Default                  | Description              |
| --------------------------------- | ------------------------ | ------------------------ |
| `--sk-accordion-border`           | `var(--sk-border)`       | Item border color        |
| `--sk-accordion-bg`               | `transparent`            | Accordion background     |
| `--sk-accordion-trigger-padding`  | `var(--sk-space-md)`     | Trigger padding          |
| `--sk-accordion-content-padding`  | `var(--sk-space-md)`     | Content padding          |
| `--sk-accordion-trigger-hover-bg` | `var(--sk-bg-secondary)` | Trigger hover background |

#### Class Names

| Class                                   | Description                      |
| --------------------------------------- | -------------------------------- |
| `.sk-accordion`                         | Root accordion container         |
| `.sk-accordion__item`                   | Individual accordion item        |
| `.sk-accordion__header`                 | Accordion item header            |
| `.sk-accordion__trigger`                | Clickable trigger button         |
| `.sk-accordion__trigger[data-expanded]` | Trigger in expanded state        |
| `.sk-accordion__trigger[data-disabled]` | Disabled trigger                 |
| `.sk-accordion__trigger-text`           | Trigger text content             |
| `.sk-accordion__chevron`                | Chevron icon (rotates on expand) |
| `.sk-accordion__content`                | Collapsible content wrapper      |
| `.sk-accordion__content[data-expanded]` | Content in expanded state        |
| `.sk-accordion__content[data-closed]`   | Content in closed state          |
| `.sk-accordion__content-inner`          | Inner content padding wrapper    |

#### Keyframe Animations

- `sk-accordion-expand` - Height expansion animation
- `sk-accordion-collapse` - Height collapse animation

#### Customization Example

```css
.sk-accordion {
  --sk-accordion-border: rgba(255, 255, 255, 0.1);
  --sk-accordion-trigger-padding: 1rem;
  --sk-accordion-trigger-hover-bg: rgba(255, 255, 255, 0.05);
}
```

---

### Badge

**File:** `src/primitives/Badge/Badge.css`

#### CSS Variables

| Variable                 | Default                  | Description                      |
| ------------------------ | ------------------------ | -------------------------------- |
| `--sk-badge-radius`      | `9999px`                 | Badge border radius (pill shape) |
| `--sk-badge-font-size`   | `var(--sk-font-size-sm)` | Badge font size                  |
| `--sk-badge-font-weight` | `500`                    | Badge font weight                |

#### Class Names

| Class                | Description                      |
| -------------------- | -------------------------------- |
| `.sk-badge`          | Root badge element               |
| `.sk-badge--label`   | Label type badge (with text)     |
| `.sk-badge--count`   | Count type badge (numeric)       |
| `.sk-badge--dot`     | Dot type badge (small indicator) |
| `.sk-badge--default` | Default gray variant             |
| `.sk-badge--success` | Success green variant            |
| `.sk-badge--warning` | Warning yellow variant           |
| `.sk-badge--danger`  | Danger red variant               |
| `.sk-badge--info`    | Info blue variant                |

#### Customization Example

```css
.sk-badge {
  --sk-badge-radius: 6px; /* Rounded instead of pill */
  --sk-badge-font-size: 11px;
  --sk-badge-font-weight: 600;
}
```

---

### Button

**File:** `src/primitives/Button/Button.css`

#### CSS Variables

| Variable                              | Default                    | Description                       |
| ------------------------------------- | -------------------------- | --------------------------------- |
| `--sk-btn-radius`                     | `var(--sk-radius-md)`      | Button border radius              |
| `--sk-btn-font-weight`                | `500`                      | Button font weight                |
| `--sk-btn-line-height`                | `1`                        | Button line height                |
| `--sk-btn-disabled-opacity`           | `0.5`                      | Disabled button opacity           |
| `--sk-btn-primary-bg`                 | `var(--sk-accent)`         | Primary button background         |
| `--sk-btn-primary-color`              | `var(--sk-text-on-accent)` | Primary button text color         |
| `--sk-btn-primary-hover-bg`           | `var(--sk-accent-hover)`   | Primary button hover background   |
| `--sk-btn-secondary-bg`               | `var(--sk-bg-tertiary)`    | Secondary button background       |
| `--sk-btn-secondary-color`            | `var(--sk-text-primary)`   | Secondary button text color       |
| `--sk-btn-secondary-hover-bg`         | `var(--sk-bg-secondary)`   | Secondary button hover background |
| `--sk-btn-ghost-bg`                   | `transparent`              | Ghost button background           |
| `--sk-btn-ghost-color`                | `var(--sk-text-secondary)` | Ghost button text color           |
| `--sk-btn-ghost-hover-bg`             | `var(--sk-bg-tertiary)`    | Ghost button hover background     |
| `--sk-btn-danger-bg`                  | `var(--sk-error)`          | Danger button background          |
| `--sk-btn-danger-color`               | `var(--sk-text-on-accent)` | Danger button text color          |
| `--sk-btn-outline-bg`                 | `transparent`              | Outline button background         |
| `--sk-btn-outline-color`              | `var(--sk-text-primary)`   | Outline button text color         |
| `--sk-btn-outline-border-color`       | `var(--sk-border)`         | Outline button border color       |
| `--sk-btn-outline-hover-bg`           | `var(--sk-bg-tertiary)`    | Outline button hover background   |
| `--sk-btn-outline-hover-border-color` | `var(--sk-accent)`         | Outline button hover border color |
| `--sk-btn-link-bg`                    | `transparent`              | Link button background            |
| `--sk-btn-link-color`                 | `var(--sk-accent)`         | Link button text color            |
| `--sk-btn-sm-padding-y`               | `var(--sk-space-xs)`       | Small button vertical padding     |
| `--sk-btn-sm-padding-x`               | `var(--sk-space-sm)`       | Small button horizontal padding   |
| `--sk-btn-sm-font-size`               | `var(--sk-font-size-base)` | Small button font size            |
| `--sk-btn-md-padding-y`               | `var(--sk-space-sm)`       | Medium button vertical padding    |
| `--sk-btn-md-padding-x`               | `var(--sk-space-md)`       | Medium button horizontal padding  |
| `--sk-btn-md-font-size`               | `var(--sk-font-size-base)` | Medium button font size           |
| `--sk-btn-lg-padding-y`               | `var(--sk-space-sm)`       | Large button vertical padding     |
| `--sk-btn-lg-padding-x`               | `var(--sk-space-lg)`       | Large button horizontal padding   |
| `--sk-btn-lg-font-size`               | `var(--sk-font-size-lg)`   | Large button font size            |

#### Class Names

| Class                    | Description                       |
| ------------------------ | --------------------------------- |
| `.sk-btn`                | Root button element               |
| `.sk-btn--primary`       | Primary variant (accent color)    |
| `.sk-btn--secondary`     | Secondary variant (gray)          |
| `.sk-btn--ghost`         | Ghost variant (transparent)       |
| `.sk-btn--danger`        | Danger variant (red)              |
| `.sk-btn--outline`       | Outline variant (bordered)        |
| `.sk-btn--link`          | Link variant (text-only)          |
| `.sk-btn--sm`            | Small size                        |
| `.sk-btn--md`            | Medium size                       |
| `.sk-btn--lg`            | Large size                        |
| `.sk-btn__spinner`       | Loading spinner element           |
| `.sk-btn__spinner-track` | Spinner track (background circle) |
| `.sk-btn__spinner-head`  | Spinner head (animated part)      |

#### Customization Example

```css
.sk-btn {
  --sk-btn-radius: 12px;
  --sk-btn-font-weight: 600;
  --sk-btn-primary-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

### Card

**File:** `src/primitives/Card/Card.css`

#### CSS Variables

| Variable                                | Default                      | Description                   |
| --------------------------------------- | ---------------------------- | ----------------------------- |
| `--sk-card-radius`                      | `var(--sk-radius-lg)`        | Card border radius            |
| `--sk-card-bg`                          | `var(--sk-bg-secondary)`     | Default variant background    |
| `--sk-card-border-color`                | `var(--sk-border-subtle)`    | Default variant border color  |
| `--sk-card-bg-outlined`                 | `transparent`                | Outlined variant background   |
| `--sk-card-border-color-outlined`       | `var(--sk-border)`           | Outlined variant border color |
| `--sk-card-bg-elevated`                 | `var(--sk-bg-elevated)`      | Elevated variant background   |
| `--sk-card-shadow-elevated`             | `0 2px 8px rgb(0 0 0 / 0.1)` | Elevated variant shadow       |
| `--sk-card-padding-none`                | `0`                          | No padding value              |
| `--sk-card-padding-sm`                  | `8px`                        | Small padding value           |
| `--sk-card-padding-md`                  | `16px`                       | Medium padding value          |
| `--sk-card-padding-lg`                  | `24px`                       | Large padding value           |
| `--sk-card-hover-bg`                    | `var(--sk-bg-tertiary)`      | Hover background (default)    |
| `--sk-card-hover-border-color`          | `var(--sk-accent-muted)`     | Hover border color (default)  |
| `--sk-card-hover-bg-outlined`           | `var(--sk-bg-secondary)`     | Hover background (outlined)   |
| `--sk-card-hover-border-color-outlined` | `var(--sk-accent)`           | Hover border color (outlined) |

#### Class Names

| Class                    | Description                  |
| ------------------------ | ---------------------------- |
| `.sk-card`               | Root card element            |
| `.sk-card--default`      | Default filled variant       |
| `.sk-card--outlined`     | Outlined variant             |
| `.sk-card--elevated`     | Elevated variant with shadow |
| `.sk-card--padding-none` | No padding                   |
| `.sk-card--padding-sm`   | Small padding                |
| `.sk-card--padding-md`   | Medium padding               |
| `.sk-card--padding-lg`   | Large padding                |
| `.sk-card--hoverable`    | Adds hover state             |
| `.sk-card--clickable`    | Adds click/hover state       |
| `.sk-card__header`       | Card header section          |
| `.sk-card__title`        | Card title text              |
| `.sk-card__description`  | Card description text        |
| `.sk-card__content`      | Card content area            |
| `.sk-card__footer`       | Card footer section          |

#### Customization Example

```css
.sk-card {
  --sk-card-radius: 16px;
  --sk-card-bg: rgba(255, 255, 255, 0.05);
  --sk-card-border-color: rgba(255, 255, 255, 0.1);
  --sk-card-shadow-elevated: 0 4px 16px rgba(0, 0, 0, 0.2);
}
```

---

### Code Block

**File:** `src/primitives/CodeBlock/CodeBlock.css`

#### CSS Variables

| Variable                    | Default   | Description             |
| --------------------------- | --------- | ----------------------- |
| `--sk-custom-code-keyword`  | `#c678dd` | Syntax: keyword color   |
| `--sk-custom-code-string`   | `#98c379` | Syntax: string color    |
| `--sk-custom-code-number`   | `#d19a66` | Syntax: number color    |
| `--sk-custom-code-function` | `#61afef` | Syntax: function color  |
| `--sk-custom-code-attr`     | `#d19a66` | Syntax: attribute color |
| `--sk-custom-code-builtin`  | `#e6c07b` | Syntax: built-in color  |
| `--sk-custom-code-type`     | `#e6c07b` | Syntax: type color      |

#### Class Names

| Class                         | Description                        |
| ----------------------------- | ---------------------------------- |
| `.sk-code-block`              | Root code block container          |
| `.sk-code-block__header`      | Code block header (language label) |
| `.sk-code-block__label`       | Language label text                |
| `.sk-code-block__body`        | Main code display area             |
| `.sk-code-block__gutter`      | Line number gutter                 |
| `.sk-code-block__line-number` | Individual line number             |
| `.sk-code-block__pre`         | Pre element wrapper                |
| `.sk-code-block__code`        | Code element                       |

#### Customization Example

```css
.sk-code-block {
  --sk-custom-code-keyword: #ff79c6;
  --sk-custom-code-string: #50fa7b;
  --sk-custom-code-function: #8be9fd;
  --sk-custom-code-number: #bd93f9;
}
```

---

### Collapsible

**File:** `src/primitives/Collapsible/Collapsible.css`

#### CSS Variables

| Variable                               | Default                    | Description              |
| -------------------------------------- | -------------------------- | ------------------------ |
| `--sk-collapsible-trigger-radius`      | `var(--sk-radius-md)`      | Trigger border radius    |
| `--sk-collapsible-trigger-padding`     | `var(--sk-space-sm)`       | Trigger padding          |
| `--sk-collapsible-trigger-font-size`   | `var(--sk-font-size-base)` | Trigger font size        |
| `--sk-collapsible-trigger-font-weight` | `500`                      | Trigger font weight      |
| `--sk-collapsible-disabled-opacity`    | `0.5`                      | Disabled trigger opacity |
| `--sk-collapsible-chevron-size`        | `var(--sk-icon-md)`        | Chevron icon size        |
| `--sk-collapsible-content-padding`     | `var(--sk-space-sm)`       | Content top padding      |

#### Class Names

| Class                                     | Description                 |
| ----------------------------------------- | --------------------------- |
| `.sk-collapsible__trigger`                | Clickable trigger button    |
| `.sk-collapsible__chevron`                | Chevron icon (rotates 180°) |
| `.sk-collapsible__chevron[data-expanded]` | Expanded state chevron      |
| `.sk-collapsible__content`                | Collapsible content wrapper |
| `.sk-collapsible__content[data-expanded]` | Content in expanded state   |
| `.sk-collapsible__content[data-closed]`   | Content in closed state     |
| `.sk-collapsible__inner`                  | Inner content padding       |

#### Keyframe Animations

- `sk-collapsible-down` - Expand animation
- `sk-collapsible-up` - Collapse animation

#### Customization Example

```css
.sk-collapsible {
  --sk-collapsible-trigger-radius: 8px;
  --sk-collapsible-trigger-padding: 12px;
  --sk-collapsible-chevron-size: 20px;
}
```

---

### Dialog

**File:** `src/primitives/Dialog/Dialog.css`

#### CSS Variables

| Variable       | Default       | Description    |
| -------------- | ------------- | -------------- |
| `--sk-z-modal` | (theme value) | Dialog z-index |

#### Class Names

| Class                                | Description                       |
| ------------------------------------ | --------------------------------- |
| `.sk-dialog__overlay`                | Semi-transparent backdrop overlay |
| `.sk-dialog__overlay[data-expanded]` | Overlay in expanded state         |
| `.sk-dialog__overlay[data-closed]`   | Overlay in closed state           |
| `.sk-dialog__positioner`             | Centers the dialog content        |
| `.sk-dialog__content`                | Main dialog content box           |
| `.sk-dialog__content[data-expanded]` | Content in expanded state         |
| `.sk-dialog__content[data-closed]`   | Content in closed state           |
| `.sk-dialog__header`                 | Dialog header section             |
| `.sk-dialog__title`                  | Dialog title text                 |
| `.sk-dialog__description`            | Dialog description text           |
| `.sk-dialog__body`                   | Dialog body content               |
| `.sk-dialog__close`                  | Close button (top-right)          |

#### Customization Example

```css
.sk-dialog__content {
  max-width: 600px;
  border-radius: 12px;
  padding: 2rem;
}
```

---

### Dropdown

**File:** `src/primitives/Dropdown/Dropdown.css`

#### CSS Variables

| Variable         | Default       | Description      |
| ---------------- | ------------- | ---------------- |
| `--sk-z-popover` | (theme value) | Dropdown z-index |

#### Class Names

| Class                                  | Description                   |
| -------------------------------------- | ----------------------------- |
| `.sk-dropdown__trigger`                | Dropdown trigger button       |
| `.sk-dropdown__content`                | Dropdown menu content         |
| `.sk-dropdown__item`                   | Individual menu item          |
| `.sk-dropdown__item[data-highlighted]` | Highlighted menu item         |
| `.sk-dropdown__item[data-disabled]`    | Disabled menu item            |
| `.sk-dropdown__item--destructive`      | Destructive action item (red) |
| `.sk-dropdown__item-icon`              | Item icon wrapper             |

#### Customization Example

```css
.sk-dropdown__content {
  min-width: 200px;
  border-radius: 8px;
}

.sk-dropdown__item {
  padding: 10px 14px;
}
```

---

### Empty State

**File:** `src/primitives/EmptyState/EmptyState.css`

#### CSS Variables

| Variable                 | Default | Description           |
| ------------------------ | ------- | --------------------- |
| `--sk-empty-state-max-w` | `400px` | Description max width |

#### Class Names

| Class                          | Description                 |
| ------------------------------ | --------------------------- |
| `.sk-empty-state`              | Root empty state container  |
| `.sk-empty-state__icon`        | Icon/illustration container |
| `.sk-empty-state__title`       | Empty state title           |
| `.sk-empty-state__description` | Description text            |
| `.sk-empty-state__action`      | Action button container     |

#### Customization Example

```css
.sk-empty-state {
  --sk-empty-state-max-w: 500px;
}
```

---

### Icon

**File:** `src/icons/Icon.css`

#### Class Names

| Class               | Description         |
| ------------------- | ------------------- |
| `.sk-icon`          | Root icon container |
| `.sk-icon--xs`      | Extra small (12px)  |
| `.sk-icon--sm`      | Small (14px)        |
| `.sk-icon--md`      | Medium (16px)       |
| `.sk-icon--lg`      | Large (20px)        |
| `.sk-icon--xl`      | Extra large (24px)  |
| `.sk-icon--loading` | Spinning animation  |

#### Keyframe Animations

- `sk-icon-spin` - Continuous rotation

---

### Input

**File:** `src/primitives/Input/Input.css`

#### Class Names

| Class                 | Description                    |
| --------------------- | ------------------------------ |
| `.sk-input-wrapper`   | Input wrapper with label/error |
| `.sk-input`           | Text input element             |
| `.sk-input--error`    | Input in error state           |
| `.sk-input__error`    | Error message text             |
| `.sk-textarea`        | Textarea element               |
| `.sk-textarea--error` | Textarea in error state        |

#### Customization Example

```css
.sk-input {
  border-radius: 8px;
  padding: 10px 12px;
}

.sk-input:focus {
  box-shadow: 0 0 0 3px var(--sk-accent);
}
```

---

### Kbd

**File:** `src/primitives/Kbd/Kbd.css`

#### Class Names

| Class               | Description                        |
| ------------------- | ---------------------------------- |
| `.sk-kbd`           | Keyboard key element               |
| `.sk-kbd-group`     | Group of keyboard keys             |
| `.sk-kbd-separator` | Separator between keys (e.g., "+") |

#### Customization Example

```css
.sk-kbd {
  min-width: 28px;
  padding: 4px 8px;
  border-radius: 4px;
}
```

---

### Progress Bar

**File:** `src/primitives/ProgressBar/ProgressBar.css`

#### Class Names

| Class                               | Description                   |
| ----------------------------------- | ----------------------------- |
| `.sk-progress`                      | Root progress bar container   |
| `.sk-progress--sm`                  | Small height (2px)            |
| `.sk-progress--md`                  | Medium height (--sk-space-xs) |
| `.sk-progress--lg`                  | Large height (--sk-space-sm)  |
| `.sk-progress__fill`                | Progress fill indicator       |
| `.sk-progress__fill--indeterminate` | Indeterminate animation       |

#### Keyframe Animations

- `sk-progress-indeterminate` - Sliding animation

---

### Progress Ring

**File:** `src/primitives/ProgressRing/ProgressRing.css`

#### Class Names

| Class                        | Description                  |
| ---------------------------- | ---------------------------- |
| `.sk-progress-ring`          | Root progress ring container |
| `.sk-progress-ring__svg`     | SVG element (rotated -90°)   |
| `.sk-progress-ring__track`   | Background circle            |
| `.sk-progress-ring__fill`    | Progress arc                 |
| `.sk-progress-ring__content` | Center content slot          |

---

### Project Card

**File:** `src/primitives/ProjectCard/ProjectCard.css`

#### Class Names

| Class                           | Description               |
| ------------------------------- | ------------------------- |
| `.sk-project-card`              | Root project card         |
| `.sk-project-card__icon`        | Project icon/avatar       |
| `.sk-project-card__info`        | Project info section      |
| `.sk-project-card__header`      | Card header with name/pin |
| `.sk-project-card__name`        | Project name              |
| `.sk-project-card__pin`         | Pin button                |
| `.sk-project-card__subtitle`    | Subtitle text             |
| `.sk-project-card__description` | Description text          |

---

### ScrollArea

**File:** `src/primitives/ScrollArea/ScrollArea.css`

#### CSS Variables

| Variable                   | Default | Description                   |
| -------------------------- | ------- | ----------------------------- |
| `--sk-scroll-thumb-radius` | `5px`   | Scrollbar thumb border radius |

#### Class Names

| Class             | Description                                |
| ----------------- | ------------------------------------------ |
| `.sk-scroll-area` | Scrollable container with custom scrollbar |

---

### Search Input

**File:** `src/primitives/SearchInput/SearchInput.css`

#### Class Names

| Class                             | Description                 |
| --------------------------------- | --------------------------- |
| `.sk-search-input`                | Root search input container |
| `.sk-search-input[data-disabled]` | Disabled state              |
| `.sk-search-input__icon`          | Search icon (left)          |
| `.sk-search-input__field`         | Text input field            |
| `.sk-search-input__clear`         | Clear button (X icon)       |
| `.sk-search-input__shortcut`      | Keyboard shortcut indicator |

---

### Select

**File:** `src/primitives/Select/Select.css`

#### CSS Variables

| Variable         | Default       | Description             |
| ---------------- | ------------- | ----------------------- |
| `--sk-z-popover` | (theme value) | Select dropdown z-index |

#### Class Names

| Class                                | Description                  |
| ------------------------------------ | ---------------------------- |
| `.sk-select__trigger`                | Select trigger button        |
| `.sk-select__icon`                   | Chevron dropdown icon        |
| `.sk-select__content`                | Dropdown options list        |
| `.sk-select__item`                   | Individual option item       |
| `.sk-select__item[data-highlighted]` | Highlighted option           |
| `.sk-select__item[data-disabled]`    | Disabled option              |
| `.sk-select__item-check`             | Check icon for selected item |

---

### Separator

**File:** `src/primitives/Separator/Separator.css`

#### CSS Variables

| Variable                | Default                                                                 | Description         |
| ----------------------- | ----------------------------------------------------------------------- | ------------------- |
| `--sk-separator-size`   | `1px`                                                                   | Separator thickness |
| `--sk-separator-color`  | `var(--sk-border)`                                                      | Separator color     |
| `--sk-separator-margin` | `var(--sk-space-md) 0` (horizontal) / `0 var(--sk-space-md)` (vertical) | Separator margin    |

#### Class Names

| Class                       | Description            |
| --------------------------- | ---------------------- |
| `.sk-separator`             | Root separator element |
| `.sk-separator--horizontal` | Horizontal divider     |
| `.sk-separator--vertical`   | Vertical divider       |

#### Customization Example

```css
.sk-separator {
  --sk-separator-size: 2px;
  --sk-separator-color: rgba(255, 255, 255, 0.2);
  --sk-separator-margin: 2rem 0;
}
```

---

### Skeleton

**File:** `src/primitives/Skeleton/Skeleton.css`

#### Class Names

| Class                  | Description           |
| ---------------------- | --------------------- |
| `.sk-skeleton`         | Root skeleton element |
| `.sk-skeleton--rect`   | Rectangle shape       |
| `.sk-skeleton--circle` | Circle shape          |
| `.sk-skeleton-text`    | Text skeleton stack   |

#### Keyframe Animations

- `sk-shimmer` - Shimmer loading effect

---

### Slider

**File:** `src/primitives/Slider/Slider.css`

#### CSS Variables

| Variable                         | Default                 | Description            |
| -------------------------------- | ----------------------- | ---------------------- |
| `--sk-slider-track-bg`           | `var(--sk-bg-tertiary)` | Track background color |
| `--sk-slider-track-height`       | `4px`                   | Track height           |
| `--sk-slider-fill-bg`            | `var(--sk-accent)`      | Fill color             |
| `--sk-slider-thumb-size`         | `18px`                  | Thumb size             |
| `--sk-slider-thumb-bg`           | `var(--sk-accent)`      | Thumb background       |
| `--sk-slider-thumb-border-color` | `white`                 | Thumb border color     |

#### Class Names

| Class                              | Description             |
| ---------------------------------- | ----------------------- |
| `.sk-slider`                       | Root slider container   |
| `.sk-slider__header`               | Label and value row     |
| `.sk-slider__label`                | Label text              |
| `.sk-slider__value`                | Current value display   |
| `.sk-slider__track`                | Slider track            |
| `.sk-slider__track[data-disabled]` | Disabled track          |
| `.sk-slider__fill`                 | Filled portion of track |
| `.sk-slider__thumb`                | Draggable thumb         |
| `.sk-slider__thumb[data-disabled]` | Disabled thumb          |

#### Customization Example

```css
.sk-slider {
  --sk-slider-track-height: 6px;
  --sk-slider-thumb-size: 24px;
  --sk-slider-fill-bg: linear-gradient(90deg, #667eea, #764ba2);
}
```

---

### Spinner

**File:** `src/primitives/Spinner/Spinner.css`

#### CSS Variables

| Variable                    | Default            | Description              |
| --------------------------- | ------------------ | ------------------------ |
| `--sk-spinner-border-width` | `2px`              | Spinner border thickness |
| `--sk-spinner-track-color`  | `var(--sk-border)` | Track/background color   |
| `--sk-spinner-color`        | `var(--sk-accent)` | Spinner head color       |
| `--sk-duration-normal`      | `0.6s`             | Spin animation duration  |

#### Class Names

| Class                    | Description              |
| ------------------------ | ------------------------ |
| `.sk-spinner`            | Root spinner element     |
| `.sk-spinner--sm`        | Small (16px)             |
| `.sk-spinner--md`        | Medium (24px)            |
| `.sk-spinner--lg`        | Large (36px)             |
| `.sk-spinner--primary`   | Primary color variant    |
| `.sk-spinner--secondary` | Secondary color variant  |
| `.sk-spinner--muted`     | Muted color variant      |
| `.sk-spinner--on-accent` | On-accent color variant  |
| `.sk-spinner__label`     | Screen-reader only label |

#### Customization Example

```css
.sk-spinner {
  --sk-spinner-border-width: 3px;
  --sk-spinner-color: #ff6b6b;
}
```

---

### Switch

**File:** `src/primitives/Switch/Switch.css`

#### CSS Variables

| Variable                       | Default                 | Description                |
| ------------------------------ | ----------------------- | -------------------------- |
| `--sk-switch-track-bg`         | `var(--sk-bg-tertiary)` | Unchecked track background |
| `--sk-switch-track-bg-checked` | `var(--sk-accent)`      | Checked track background   |
| `--sk-switch-thumb-bg`         | `white`                 | Thumb background color     |
| `--sk-duration-fast`           | `150ms`                 | Toggle transition duration |

#### Class Names

| Class                               | Description               |
| ----------------------------------- | ------------------------- |
| `.sk-switch`                        | Root switch container     |
| `.sk-switch[data-disabled]`         | Disabled switch           |
| `.sk-switch__main`                  | Label/description wrapper |
| `.sk-switch__label`                 | Switch label text         |
| `.sk-switch__description`           | Switch description        |
| `.sk-switch__control`               | Toggle track element      |
| `.sk-switch__control[data-checked]` | Checked track             |
| `.sk-switch__thumb`                 | Draggable thumb           |
| `.sk-switch--md`                    | Medium size (default)     |
| `.sk-switch--sm`                    | Small size                |

#### Customization Example

```css
.sk-switch {
  --sk-switch-track-bg: rgba(0, 0, 0, 0.3);
  --sk-switch-track-bg-checked: #10b981;
  --sk-switch-thumb-bg: #ffffff;
}
```

---

### Tabs

**File:** `src/primitives/Tabs/Tabs.css`

#### Class Names

| Class                                      | Description            |
| ------------------------------------------ | ---------------------- |
| `.sk-tabs`                                 | Root tabs container    |
| `.sk-tabs--vertical`                       | Vertical tab layout    |
| `.sk-tabs__list`                           | Tab triggers list      |
| `.sk-tabs__list--vertical`                 | Vertical triggers list |
| `.sk-tabs__trigger`                        | Individual tab button  |
| `.sk-tabs__trigger[data-selected]`         | Selected tab           |
| `.sk-tabs__trigger[data-disabled]`         | Disabled tab           |
| `.sk-tabs__content`                        | Tab panel content      |
| `.sk-tabs__content[data-state='inactive']` | Inactive panel         |

---

### Timeline

**File:** `src/primitives/Timeline/Timeline.css`

#### Class Names

| Class                           | Description              |
| ------------------------------- | ------------------------ |
| `.sk-timeline`                  | Root timeline container  |
| `.sk-timeline--vertical`        | Vertical layout          |
| `.sk-timeline--horizontal`      | Horizontal layout        |
| `.sk-timeline__item`            | Individual timeline item |
| `.sk-timeline__item--completed` | Completed status         |
| `.sk-timeline__item--active`    | Active/current status    |
| `.sk-timeline__item--pending`   | Pending status           |
| `.sk-timeline__marker`          | Dot + line wrapper       |
| `.sk-timeline__dot`             | Status dot/icon          |
| `.sk-timeline__line`            | Connecting line          |
| `.sk-timeline__content`         | Item content             |
| `.sk-timeline__title`           | Item title               |
| `.sk-timeline__description`     | Item description         |
| `.sk-timeline__meta`            | Metadata text            |
| `.sk-timeline--sm`              | Small size               |
| `.sk-timeline--md`              | Medium size              |
| `.sk-timeline--lg`              | Large size               |

---

### Tooltip

**File:** `src/primitives/Tooltip/Tooltip.css`

#### CSS Variables

| Variable         | Default       | Description     |
| ---------------- | ------------- | --------------- |
| `--sk-z-tooltip` | (theme value) | Tooltip z-index |

#### Class Names

| Class                  | Description             |
| ---------------------- | ----------------------- |
| `.sk-tooltip__trigger` | Tooltip trigger wrapper |
| `.sk-tooltip__content` | Tooltip content box     |

---

## Composites

### Confirm Dialog

**File:** `src/composites/ConfirmDialog/ConfirmDialog.css`

#### Class Names

| Class                        | Description                |
| ---------------------------- | -------------------------- |
| `.sk-confirm-dialog__footer` | Footer with action buttons |

---

### Toast

**File:** `src/composites/Toast/Toast.css`

#### CSS Variables

| Variable                | Default       | Description         |
| ----------------------- | ------------- | ------------------- |
| `--sk-z-toast`          | (theme value) | Toast z-index       |
| `--sk-toast-max-w`      | `420px`       | Toast max width     |
| `--sk-toast-progress-h` | `3px`         | Progress bar height |

#### Class Names

| Class                               | Description              |
| ----------------------------------- | ------------------------ |
| `.sk-toast-container`               | Fixed toast container    |
| `.sk-toast-container--top-right`    | Top-right position       |
| `.sk-toast-container--top-left`     | Top-left position        |
| `.sk-toast-container--bottom-right` | Bottom-right position    |
| `.sk-toast-container--bottom-left`  | Bottom-left position     |
| `.sk-toast`                         | Individual toast element |
| `.sk-toast--success`                | Success variant (green)  |
| `.sk-toast--error`                  | Error variant (red)      |
| `.sk-toast--warning`                | Warning variant (yellow) |
| `.sk-toast--info`                   | Info variant (blue)      |
| `.sk-toast__content`                | Toast content wrapper    |
| `.sk-toast__icon`                   | Toast icon               |
| `.sk-toast__text`                   | Text content wrapper     |
| `.sk-toast__title`                  | Toast title              |
| `.sk-toast__description`            | Toast description        |
| `.sk-toast__close`                  | Close button             |
| `.sk-toast__progress`               | Progress bar             |

#### Keyframe Animations

- `sk-toast-slide-in` - Slide in from right

#### Customization Example

```css
.sk-toast {
  --sk-toast-max-w: 500px;
  --sk-toast-progress-h: 4px;
}
```

---

## Theme Integration

All CSS variables reference the HyperKit theme system. Override theme variables globally in `ThemeProvider`:

```tsx
import { ThemeProvider } from '@ybouhjira/hyperkit';

<ThemeProvider
  theme={{
    colors: {
      accent: '#ff6b6b',
      bg: { primary: '#1a1a1a', secondary: '#2a2a2a' },
      text: { primary: '#ffffff', secondary: '#a0a0a0' },
    },
    spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
    radius: { sm: '4px', md: '8px', lg: '12px' },
  }}
>
  {/* Your app */}
</ThemeProvider>;
```

Or override component-specific variables in your CSS:

```css
:root {
  /* Override button colors */
  --sk-btn-primary-bg: #ff6b6b;
  --sk-btn-primary-hover-bg: #ff5252;

  /* Override card styling */
  --sk-card-radius: 16px;
  --sk-card-shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.3);
}
```

---

## CSS Class Naming Convention

All HyperKit classes follow BEM (Block Element Modifier) with the `sk-` prefix:

- **Block**: `.sk-{component}` (e.g., `.sk-button`, `.sk-card`)
- **Element**: `.sk-{component}__{element}` (e.g., `.sk-card__title`)
- **Modifier**: `.sk-{component}--{modifier}` (e.g., `.sk-button--primary`)
- **State**: `[data-state]` attributes (e.g., `[data-checked]`, `[data-expanded]`)

---

## Additional Resources

- **Component API**: See `/llms.txt` for prop interfaces
- **Storybook**: Run `npm run storybook` for interactive examples
- **Theme Guide**: See theme documentation for color/spacing/radius tokens
- **AI Docs**: Per-component AI documentation in `/docs/ai/{ComponentName}.md`
