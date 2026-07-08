---
title: SettingsPanel
description: Tabbed settings drawer.
slug: /components/utilities/SettingsPanel
---

# SettingsPanel

Tabbed settings drawer.

![SettingsPanel preview](/img/components/SettingsPanel.webp)

```tsx
import { SettingsPanel } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `settings` * | `SettingsConfig` | — | — |
| `onChange` * | `(settings: SettingsConfig) => void` | — | — |
| `availableThemes` | `Array<{ id: string; name: string }>` | — | — |

`*` required prop.
