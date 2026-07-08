# usePanelDrag

**Kind:** hook | **Category:** Hooks

## Signature

```ts
(onMove: (panelId: string, toPosition: PanelPosition) => void) => { dragState: Accessor<PanelDragState>; startDrag: (panelId: string, event: PointerEvent) => void; dropZones: Accessor<...>; registerDropZone: (position: PanelPosition, element: HTMLElement) => void; unregisterDropZone: (position: PanelPosition) => voi...
```

## Import

```ts
import { usePanelDrag } from '@ybouhjira/hyperkit';
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
