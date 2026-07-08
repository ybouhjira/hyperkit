# Parts System Quick Reference

## Basic Usage

```tsx
import { IssueMap } from './components/IssueMap/IssueMap';

// Default (all features)
<IssueMap issues={myIssues} />

// Use a preset
<IssueMap issues={myIssues} preset="minimal" />

// Customize parts
<IssueMap
  issues={myIssues}
  parts={{
    zoomControls: false,
    nodeProgressBar: false,
  }}
/>

// Preset + overrides
<IssueMap
  issues={myIssues}
  preset="dashboard"
  parts={{
    nodeBadge: { enabled: true }
  }}
/>
```

## IssueMap Parts

| Part               | What It Controls                        |
| ------------------ | --------------------------------------- |
| `root`             | Outer container styling                 |
| `switcher`         | Project/layer/status group switcher bar |
| `graph`            | Diagram SVG container                   |
| `nodeNumber`       | Issue number display (#1, #2, etc.)     |
| `nodeBadge`        | Status badge (active, blocked, etc.)    |
| `nodeTitle`        | Issue title text                        |
| `nodeProjectLabel` | Project name label in nodes             |
| `nodeProgressBar`  | Task progress indicator bar             |
| `zoomControls`     | Zoom in/out/fit overlay buttons         |
| `layerGroups`      | Layer grouping visual frames            |

## Built-in Presets

| Preset       | Best For                   | What's Disabled                                  |
| ------------ | -------------------------- | ------------------------------------------------ |
| `full`       | Full-featured dashboards   | Nothing (all enabled)                            |
| `minimal`    | Presentations, screenshots | Switcher, badges, labels, progress, zoom, groups |
| `compact`    | Dense layouts              | Progress, labels, groups                         |
| `enterprise` | Professional dashboards    | Nothing (+ enhanced styling)                     |
| `dashboard`  | Embedded panels            | Switcher, zoom, labels                           |

## Part Configuration

```tsx
parts={{
  // Disable a part
  zoomControls: false,

  // Or use object syntax
  zoomControls: { enabled: false },

  // Add custom styles
  switcher: {
    enabled: true,
    style: {
      'background-color': '#1a1a1a',
      'border-bottom': '2px solid #333',
    }
  },

  // Add CSS class
  graph: {
    class: 'my-custom-graph',
  },

  // Add HTML attributes
  root: {
    attrs: { 'data-testid': 'issue-map' },
  },
}}
```

## Behavior vs Parts

**Behavior** = How it works (runtime config):

```tsx
behavior={{
  groupBy: 'layer',           // What to group by
  switcherVariant: 'pill',    // UI style
  transition: 'slide',        // Animation
  nodeWidth: 320,             // Sizing
  autoFit: true,              // Auto-zoom
}}
```

**Parts** = What's visible (UI customization):

```tsx
parts={{
  switcher: false,            // Hide switcher
  zoomControls: false,        // Hide zoom buttons
  nodeProgressBar: false,     // Hide progress bars
}}
```

## Common Patterns

### Presentation Mode

```tsx
<IssueMap issues={myIssues} preset="minimal" />
```

### Embedded Dashboard Panel

```tsx
<IssueMap issues={myIssues} preset="dashboard" behavior={{ groupBy: 'none' }} />
```

### Custom Styled Compact

```tsx
<IssueMap
  issues={myIssues}
  preset="compact"
  parts={{
    root: {
      style: { 'border-radius': '12px', overflow: 'hidden' },
    },
  }}
/>
```

### Focus Mode (Just Structure)

```tsx
<IssueMap
  issues={myIssues}
  parts={{
    nodeBadge: false,
    nodeProgressBar: false,
    nodeProjectLabel: false,
    zoomControls: false,
  }}
/>
```

## Backward Compatibility

Old code still works:

```tsx
// Old way (still works)
<IssueMap
  issues={myIssues}
  config={{
    showZoomControls: false,
    showProgress: false,
    groupBy: 'layer',
  }}
/>

// New way (recommended)
<IssueMap
  issues={myIssues}
  preset="compact"
  behavior={{ groupBy: 'layer' }}
/>
```

## TypeScript Support

Full type safety:

```tsx
import type { IssueMapPartName, IssueMapPresetName } from './presets';
import type { PartsConfig } from './parts';

const myParts: PartsConfig<IssueMapPartName> = {
  zoomControls: false, // ✓ Type-safe
  invalidPart: false, // ✗ Type error
};

const preset: IssueMapPresetName = 'minimal'; // ✓ Auto-complete works
```

## Creating Custom Presets

```tsx
import { definePreset } from './parts';
import type { IssueMapPartName } from './presets';

const myPreset = definePreset<IssueMapPartName>(
  'presentation',
  {
    switcher: false,
    zoomControls: false,
    nodeProgressBar: false,
  },
  'Clean view for client presentations'
);

<IssueMap issues={myIssues} preset={myPreset} />;
```

## Testing Parts

```tsx
import { render } from '@solidjs/testing-library';
import { IssueMap } from './IssueMap';

it('should hide zoom controls when disabled', () => {
  const { container } = render(() => (
    <IssueMap issues={testIssues} parts={{ zoomControls: false }} />
  ));

  expect(container.querySelector('[title="Zoom in"]')).toBeFalsy();
});
```

## Debugging

Check resolved parts:

```tsx
import { resolveParts } from './parts';
import { issueMapAnatomy, minimalPreset } from './presets';

const resolved = resolveParts(issueMapAnatomy, minimalPreset, { nodeBadge: { enabled: true } });

console.log(resolved.nodeBadge.enabled); // true (override wins)
console.log(resolved.switcher.enabled); // false (from preset)
```

## Performance Tips

- Disabled parts don't render → fewer DOM nodes
- Disabled parts skip logic → faster mounting
- Use `preset="minimal"` for best performance
- Dashboard preset good for embedded views (no switcher overhead)

## Storybook

Try all presets interactively:

```bash
npm run storybook
# Navigate to: Tools > Issue Map Presets Gallery
```

## Migration Checklist

Migrating from old config? Follow these steps:

1. **Behavioral flags** → Move to `behavior` prop
   - `groupBy`, `switcherVariant`, `transition`, `nodeWidth`, `nodeHeight`, `autoFit`, `showGrid`

2. **Visibility flags** → Use `preset` or `parts` prop
   - `showZoomControls` → `parts={{ zoomControls: false }}`
   - `showProgress` → `parts={{ nodeProgressBar: false }}`
   - `showProjectLabel` → `parts={{ nodeProjectLabel: false }}`
   - `showLayerGroups` → `parts={{ layerGroups: false }}`

3. **Choose a preset** if it matches your needs:
   - All features? → `preset="full"` (or omit)
   - Clean/simple? → `preset="minimal"`
   - Embedded? → `preset="dashboard"`

4. **Override parts** only when needed

## Help & Documentation

- Full guide: `docs/PARTS_SYSTEM.md`
- API reference: `docs/PARTS_SYSTEM.md#api-reference`
- Implementation details: `docs/PARTS_IMPLEMENTATION_SUMMARY.md`
- Tests: `__tests__/IssueMapParts.test.tsx`
