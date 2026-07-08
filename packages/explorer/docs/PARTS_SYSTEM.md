# Parts + Presets System

The IssueMap component implements a "Parts + Presets" customization system that allows fine-grained control over component features and appearance.

## Core Concepts

### Parts (Anatomy)

Every component has an **anatomy** — a list of customizable parts. For IssueMap, these are:

```typescript
const ISSUE_MAP_PARTS = [
  'root', // Outer container
  'switcher', // Project/group switcher bar
  'graph', // The diagram container
  'nodeNumber', // #N issue number in nodes
  'nodeBadge', // Status badge in nodes
  'nodeTitle', // Issue title text in nodes
  'nodeProjectLabel', // Project name label in nodes
  'nodeProgressBar', // Progress bar in nodes
  'zoomControls', // +/-/Fit zoom buttons
  'layerGroups', // Layer group frames around nodes
] as const;
```

Each part can be:

- **Enabled/disabled** — When disabled, the part doesn't render AND associated logic doesn't run
- **Styled** — Custom CSS applied on top of defaults
- **Customized** — Additional classes and attributes

### Presets

Presets are named bundles of parts configuration. IssueMap includes:

| Preset         | Description                              | Parts Configuration                                       |
| -------------- | ---------------------------------------- | --------------------------------------------------------- |
| **full**       | Everything enabled (default)             | All parts enabled with default styles                     |
| **minimal**    | Clean graph with just numbers and titles | Disables: switcher, badge, labels, progress, zoom, groups |
| **compact**    | Essential info only                      | Disables: progress, labels, groups                        |
| **enterprise** | Full features with refined styling       | All enabled + enhanced switcher border                    |
| **dashboard**  | Embedded view without chrome             | Disables: switcher, zoom, labels                          |

### Behavior vs Parts

The system separates **behavior** (how the component works) from **parts** (what is visible):

**Behavior** — runtime configuration:

- `groupBy` — How to group issues
- `switcherVariant` — UI style for switcher (tabs/dropdown/pill)
- `transition` — Animation style
- `nodeWidth`, `nodeHeight` — Sizing
- `autoFit`, `showGrid` — Display options

**Parts** — visibility and styling:

- What renders on screen
- What logic executes
- Custom styling per part

## Usage

### Basic Usage (Default)

```tsx
import { IssueMap } from './components/IssueMap/IssueMap';

<IssueMap issues={myIssues} />;
```

### Using Presets

```tsx
// Named preset
<IssueMap issues={myIssues} preset="minimal" />

// Custom preset object
<IssueMap
  issues={myIssues}
  preset={{
    name: 'custom',
    description: 'My custom preset',
    parts: {
      switcher: false,
      nodeProgressBar: false,
    }
  }}
/>
```

### Per-Part Overrides

Overrides apply on top of the preset:

```tsx
<IssueMap
  issues={myIssues}
  preset="full"
  parts={{
    zoomControls: false, // Disable zoom controls
    nodeProgressBar: false, // Disable progress bars
    switcher: {
      // Custom styling
      style: { 'background-color': '#1a1a1a' },
    },
  }}
/>
```

### Behavior Configuration

```tsx
<IssueMap
  issues={myIssues}
  preset="compact"
  behavior={{
    groupBy: 'layer',
    switcherVariant: 'pill',
    transition: 'slide',
    nodeWidth: 320,
    nodeHeight: 140,
  }}
/>
```

### Backward Compatibility

The old `config` prop still works:

```tsx
<IssueMap
  issues={myIssues}
  config={{
    groupBy: 'project',
    switcherVariant: 'tabs',
    showZoomControls: true,
    showProgress: true,
  }}
/>
```

This maps to the new behavior system internally.

## Advanced Usage

### Custom Layout

You can provide a custom layout function that receives rendered parts:

```tsx
<IssueMap
  issues={myIssues}
  layout={(parts) => (
    <div style={{ display: 'grid', 'grid-template-rows': 'auto 1fr' }}>
      <div style={{ padding: '16px', background: '#000' }}>{parts.switcher}</div>
      <div style={{ position: 'relative' }}>{parts.graph}</div>
    </div>
  )}
/>
```

**Note:** `parts.zoomControls` is always `null` in the layout function because zoom controls are positioned inside the graph for proper SVG overlay.

### Creating Custom Presets

```typescript
import { definePreset } from './components/IssueMap/parts';
import type { IssueMapPartName } from './components/IssueMap/presets';

const myPreset = definePreset<IssueMapPartName>(
  'presentation',
  {
    switcher: false,
    zoomControls: false,
    nodeProgressBar: false,
    graph: {
      style: {
        'border': '1px solid var(--sk-border)',
        'border-radius': 'var(--sk-radius-lg)',
      }
    }
  },
  'Clean view for presentations'
);

// Use it
<IssueMap issues={myIssues} preset={myPreset} />
```

### Programmatic Parts Resolution

You can resolve parts configuration manually:

```typescript
import { resolveParts } from './components/IssueMap/parts';
import { issueMapAnatomy, minimalPreset } from './components/IssueMap/presets';

const resolved = resolveParts(
  issueMapAnatomy,
  minimalPreset,
  { nodeBadge: { enabled: true } } // Override
);

console.log(resolved.nodeBadge.enabled); // true
console.log(resolved.switcher.enabled); // false (from preset)
```

## Implementation Details

### Resolution Priority

When resolving parts configuration:

1. **Default** — All parts enabled, no custom styles
2. **Preset** — Apply preset configuration
3. **Overrides** — Apply user overrides (highest priority)

### Disabling Parts

When a part is disabled (`enabled: false`):

- The part doesn't render in the DOM
- Associated logic doesn't execute
- No performance cost for disabled features

For example, disabling `layerGroups`:

- No group frames are created
- The grouping logic in `onMount` is skipped
- No group data is stored

### False Shorthand

You can use `false` as shorthand for `{ enabled: false }`:

```tsx
// These are equivalent:
parts={{ zoomControls: false }}
parts={{ zoomControls: { enabled: false } }}
```

### Style Merging

Styles are merged using object spread:

```tsx
parts={{
  root: {
    style: {
      'background-color': 'black',
      'padding': '20px',
    }
  }
}}
```

The component's default inline styles are applied first, then part styles override them.

## Testing

The parts system includes comprehensive tests:

```bash
npx -w @ybouhjira/explorer vitest run __tests__/IssueMapParts.test.tsx
```

Tests cover:

- Default resolution (all enabled)
- Preset application
- Override merging
- Backward compatibility
- Component rendering with presets

## Migration Guide

### From Old Config to New System

**Old way:**

```tsx
<IssueMap
  issues={myIssues}
  config={{
    showZoomControls: false,
    showProgress: false,
    showLayerGroups: false,
  }}
/>
```

**New way (preset):**

```tsx
<IssueMap
  issues={myIssues}
  preset="minimal" // Disables zoom, progress, groups, and more
/>
```

**New way (explicit):**

```tsx
<IssueMap
  issues={myIssues}
  parts={{
    zoomControls: false,
    nodeProgressBar: false,
    layerGroups: false,
  }}
/>
```

### Behavioral Config

**Old way:**

```tsx
<IssueMap
  issues={myIssues}
  config={{
    groupBy: 'layer',
    switcherVariant: 'pill',
    nodeWidth: 320,
  }}
/>
```

**New way:**

```tsx
<IssueMap
  issues={myIssues}
  behavior={{
    groupBy: 'layer',
    switcherVariant: 'pill',
    nodeWidth: 320,
  }}
/>
```

**Note:** The old `config` prop still works for backward compatibility.

## Future Enhancements

Potential improvements to the parts system:

1. **Part Variants** — Multiple rendering variants per part (e.g., `nodeBadge: 'pill' | 'square' | 'minimal'`)
2. **Part Slots** — Ability to replace entire parts with custom components
3. **Conditional Parts** — Parts that only render based on data (e.g., progress bar only if tasks exist)
4. **Theme Integration** — Presets that integrate with HyperKit theme system
5. **Animation Presets** — Named transition configurations

## API Reference

### Types

```typescript
// Part configuration
interface PartConfig {
  enabled?: boolean; // Default: true
  style?: JSX.CSSProperties; // Custom CSS
  class?: string; // CSS class name
  attrs?: Record<string, string>; // HTML attributes
}

// Parts map
type PartsConfig<T> = {
  [K in T]?: PartConfig | false; // false = shorthand for disabled
};

// Preset definition
interface ComponentPreset<T> {
  name: string;
  description?: string;
  parts: PartsConfig<T>;
}

// Resolved part (always has concrete values)
interface ResolvedPart {
  enabled: boolean;
  style: JSX.CSSProperties;
  class: string;
  attrs: Record<string, string>;
}
```

### Functions

```typescript
// Define component anatomy
function defineAnatomy<T>(name: string, parts: readonly T[]): ComponentAnatomy<T>;

// Define a preset
function definePreset<T>(
  name: string,
  parts: PartsConfig<T>,
  description?: string
): ComponentPreset<T>;

// Resolve parts configuration
function resolveParts<T>(
  anatomy: ComponentAnatomy<T>,
  preset?: ComponentPreset<T>,
  overrides?: PartsConfig<T>
): Record<T, ResolvedPart>;

// Check if a part is enabled
function isPartEnabled<T>(resolved: Record<T, ResolvedPart>, part: T): boolean;
```

### Component Props

```typescript
interface IssueMapProps {
  issues: readonly IssueData[];

  // Behavioral configuration
  behavior?: Partial<IssueMapBehavior>;

  // Preset (named or object)
  preset?: IssueMapPresetName | ComponentPreset<IssueMapPartName>;

  // Per-part overrides
  parts?: PartsConfig<IssueMapPartName>;

  // Custom layout
  layout?: (parts: IssueMapRenderedParts) => JSX.Element;

  // Backward compat
  config?: Partial<IssueMapConfig>;
}
```

## Storybook Integration

The IssueMap story includes preset and part controls:

- **preset** dropdown — Select from all built-in presets
- **showZoomControls**, **showProgress**, etc. — Individual part toggles
- **groupBy**, **switcherVariant** — Behavior controls

Open Storybook to experiment:

```bash
npm run storybook
# Navigate to Tools > Issue Map
```
