import type { Node, NodeId } from '../graph/types';

export interface AlignmentGuide {
  readonly type: 'horizontal' | 'vertical';
  readonly position: number; // x for vertical, y for horizontal
  readonly from: number;     // start position on the perpendicular axis
  readonly to: number;       // end position on the perpendicular axis
}

export interface SnapResult {
  readonly snappedX: number;
  readonly snappedY: number;
  readonly guides: ReadonlyArray<AlignmentGuide>;
}

const SNAP_THRESHOLD = 5;

/** Detect alignment guides and compute snap positions for a dragged node */
export const computeAlignmentSnap = (
  draggedNodeId: NodeId,
  dragX: number,
  dragY: number,
  dragWidth: number,
  dragHeight: number,
  otherNodes: ReadonlyArray<{ id: NodeId; x: number; y: number; width: number; height: number }>,
  threshold: number = SNAP_THRESHOLD
): SnapResult => {
  const guides: AlignmentGuide[] = [];
  let snappedX = dragX;
  let snappedY = dragY;
  let minDx = threshold + 1;
  let minDy = threshold + 1;

  const dragCenterX = dragX + dragWidth / 2;
  const dragCenterY = dragY + dragHeight / 2;
  const dragRight = dragX + dragWidth;
  const dragBottom = dragY + dragHeight;

  for (const other of otherNodes) {
    if (other.id === draggedNodeId) continue;

    const otherCenterX = other.x + other.width / 2;
    const otherCenterY = other.y + other.height / 2;
    const otherRight = other.x + other.width;
    const otherBottom = other.y + other.height;

    // Vertical alignments (snap X)
    const verticalChecks = [
      { dragVal: dragX, otherVal: other.x },           // left-left
      { dragVal: dragX, otherVal: otherRight },         // left-right
      { dragVal: dragRight, otherVal: other.x },        // right-left
      { dragVal: dragRight, otherVal: otherRight },     // right-right
      { dragVal: dragCenterX, otherVal: otherCenterX }, // center-center
    ];

    for (const check of verticalChecks) {
      const diff = Math.abs(check.dragVal - check.otherVal);
      if (diff < threshold && diff < minDx) {
        minDx = diff;
        snappedX = dragX + (check.otherVal - check.dragVal);
        // Clear previous vertical guides and add new one
        const existingVertical = guides.findIndex(g => g.type === 'vertical');
        if (existingVertical >= 0) guides.splice(existingVertical, 1);
        guides.push({
          type: 'vertical',
          position: check.otherVal,
          from: Math.min(dragY, other.y),
          to: Math.max(dragBottom, otherBottom),
        });
      }
    }

    // Horizontal alignments (snap Y)
    const horizontalChecks = [
      { dragVal: dragY, otherVal: other.y },             // top-top
      { dragVal: dragY, otherVal: otherBottom },          // top-bottom
      { dragVal: dragBottom, otherVal: other.y },         // bottom-top
      { dragVal: dragBottom, otherVal: otherBottom },     // bottom-bottom
      { dragVal: dragCenterY, otherVal: otherCenterY },   // center-center
    ];

    for (const check of horizontalChecks) {
      const diff = Math.abs(check.dragVal - check.otherVal);
      if (diff < threshold && diff < minDy) {
        minDy = diff;
        snappedY = dragY + (check.otherVal - check.dragVal);
        const existingHorizontal = guides.findIndex(g => g.type === 'horizontal');
        if (existingHorizontal >= 0) guides.splice(existingHorizontal, 1);
        guides.push({
          type: 'horizontal',
          position: check.otherVal,
          from: Math.min(dragX, other.x),
          to: Math.max(dragRight, otherRight),
        });
      }
    }
  }

  return { snappedX, snappedY, guides };
};
