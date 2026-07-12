---
title: Explorer
sidebar_position: 6
description: A SolidJS-native component workbench for stories, services, and algorithms.
---

# `HyperKit Explorer`

A modern Storybook replacement built specifically for SolidJS. Test UI components, services, and algorithms in an interactive environment.

## Features

- Interactive component previews with live controls
- Service story testing with action logging
- Real-time output console
- Searchable story tree navigation
- Dark theme with HyperKit styling
- Resizable panels
- Zero configuration story discovery

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter @ybouhjira/explorer dev

# Run tests
pnpm --filter @ybouhjira/explorer test

# Build
pnpm --filter @ybouhjira/explorer build
```

The explorer will be available at http://localhost:6007

## Writing Stories

### Component Story

```typescript
import { Button } from '@ybouhjira/hyperkit';
import { defineStory, control } from '@ybouhjira/explorer/api';

export const ButtonStory = defineStory({
  title: 'Button',
  category: 'Primitives/Button',
  component: Button,
  controls: {
    variant: control.select(['primary', 'secondary'], 'primary', 'Variant'),
    disabled: control.boolean(false, 'Disabled'),
    children: control.text('Click Me', 'Label'),
  },
});
```

### Service Story

```typescript
import { defineServiceStory } from '@ybouhjira/explorer/api';

export const MyService = defineServiceStory({
  name: 'Logger Service',
  category: 'Services',
  description: 'Test logging functionality',
  actions: {
    'Log Info': async () => console.log('Info message'),
    'Log Error': async () => console.error('Error message'),
  },
});
```

## Story Discovery

Stories are automatically discovered from:

- `../../src/**/*.story.tsx`
- `../../src/**/*.stories.tsx`
- `../../packages/**/*.story.tsx`
- `../../packages/**/*.stories.tsx`
- `./stories/**/*.story.tsx`

## Control Types

- `control.text(defaultValue, label?)` - Text input
- `control.number(defaultValue, options?)` - Number input with min/max/step
- `control.boolean(defaultValue, label?)` - Checkbox
- `control.select(options, defaultValue, label?)` - Dropdown select
- `control.json(defaultValue, label?)` - JSON editor

## Architecture

```
packages/explorer/
├── src/
│   ├── api/              # Public API (story definitions, controls)
│   ├── components/       # UI components
│   │   ├── Sidebar/      # Tree navigation + search
│   │   ├── Preview/      # Story preview renderers
│   │   ├── Controls/     # Control inputs
│   │   ├── Output/       # Console and action logs
│   │   └── shared/       # Shared components
│   ├── stores/           # Global state management
│   └── utils/            # Utility functions
├── stories/              # Built-in example stories
└── __tests__/           # Unit tests
```
