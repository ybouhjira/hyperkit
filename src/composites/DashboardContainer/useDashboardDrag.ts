import { createSignal, onCleanup } from 'solid-js';
import type { CardLayout } from './types';

interface DragSession {
  cardId: string;
  pointerId: number;
  containerEl: HTMLElement;
  startPointerX: number;
  startPointerY: number;
  startCol: number;
  startRow: number;
  cellW: number;
  cellH: number;
  rafId: number | null;
  pendingCol: number;
  pendingRow: number;
}

interface ResizeSession {
  cardId: string;
  pointerId: number;
  containerEl: HTMLElement;
  startPointerX: number;
  startPointerY: number;
  startCols: number;
  startRows: number;
  cellW: number;
  cellH: number;
  rafId: number | null;
  pendingCols: number;
  pendingRows: number;
}

interface UseDashboardDragOptions {
  readonly isEditing: () => boolean;
  readonly columns: () => number;
  readonly rowHeight: () => number;
  readonly gap: () => 'sm' | 'md' | 'lg';
  readonly layout: readonly CardLayout[];
  readonly containerRef: () => HTMLDivElement;
  readonly getConfig: (
    id: string
  ) =>
    | { minSize?: { cols?: number; rows?: number }; maxSize?: { cols?: number; rows?: number } }
    | undefined;
  readonly onMove: (cardId: string, col: number, row: number) => void;
  readonly onResize: (cardId: string, cols: number, rows: number) => void;
}

const parseGapPx = (g: 'sm' | 'md' | 'lg'): number => {
  const map: Record<'sm' | 'md' | 'lg', number> = { sm: 8, md: 16, lg: 24 };
  return map[g];
};

export function useDashboardDrag(options: UseDashboardDragOptions) {
  const [dragState, setDragState] = createSignal<{
    cardId: string;
    col: number;
    row: number;
  } | null>(null);

  const [resizeState, setResizeState] = createSignal<{
    cardId: string;
    cols: number;
    rows: number;
  } | null>(null);

  let dragSession: DragSession | null = null;
  let resizeSession: ResizeSession | null = null;

  // ── Cell size helper ─────────────────────────────────────────────────────

  const getCellSize = (): { cellW: number; cellH: number } => {
    const rect = options.containerRef().getBoundingClientRect();
    const gapPx = parseGapPx(options.gap());
    const totalGap = gapPx * (options.columns() - 1);
    const cellW = (rect.width - totalGap) / options.columns();
    const cellH = options.rowHeight();
    return { cellW, cellH };
  };

  const snapToGrid = (
    deltaX: number,
    deltaY: number,
    cellW: number,
    cellH: number
  ): { dCol: number; dRow: number } => {
    const gapPx = parseGapPx(options.gap());
    const dCol = Math.round(deltaX / (cellW + gapPx));
    const dRow = Math.round(deltaY / (cellH + gapPx));
    return { dCol, dRow };
  };

  // ── Drag ─────────────────────────────────────────────────────────────────

  const flushDrag = () => {
    if (!dragSession) return;
    dragSession.rafId = null;

    const { cardId, pendingCol, pendingRow } = dragSession;
    const currentLayout = options.layout.find((l) => l.id === cardId);
    if (!currentLayout) return;

    const clampedCol = Math.max(0, Math.min(options.columns() - currentLayout.cols, pendingCol));
    const clampedRow = Math.max(0, pendingRow);

    setDragState({ cardId, col: clampedCol, row: clampedRow });
  };

  const onDragMove = (e: PointerEvent) => {
    if (!dragSession) return;

    const dx = e.clientX - dragSession.startPointerX;
    const dy = e.clientY - dragSession.startPointerY;
    const { dCol, dRow } = snapToGrid(dx, dy, dragSession.cellW, dragSession.cellH);

    dragSession.pendingCol = dragSession.startCol + dCol;
    dragSession.pendingRow = dragSession.startRow + dRow;

    if (dragSession.rafId === null) {
      dragSession.rafId = requestAnimationFrame(flushDrag);
    }
  };

  const onDragEnd = () => {
    if (!dragSession) return;

    if (dragSession.rafId !== null) {
      cancelAnimationFrame(dragSession.rafId);
      dragSession.rafId = null;
    }

    const ds = dragState();
    if (ds && ds.cardId === dragSession.cardId) {
      options.onMove(ds.cardId, ds.col, ds.row);
    }

    setDragState(null);
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', onDragEnd);
    dragSession = null;
  };

  const handleDragStart = (cardId: string, e: PointerEvent) => {
    if (!options.isEditing()) return;

    const currentLayout = options.layout.find((l) => l.id === cardId);
    if (!currentLayout) return;

    const { cellW, cellH } = getCellSize();

    dragSession = {
      cardId,
      pointerId: e.pointerId,
      containerEl: options.containerRef(),
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startCol: currentLayout.col,
      startRow: currentLayout.row,
      cellW,
      cellH,
      rafId: null,
      pendingCol: currentLayout.col,
      pendingRow: currentLayout.row,
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', onDragEnd);
  };

  // ── Resize ──────────────────────────────────────────────────────────────

  const flushResize = () => {
    if (!resizeSession) return;
    resizeSession.rafId = null;

    const { cardId, pendingCols, pendingRows } = resizeSession;
    const config = options.getConfig(cardId);
    const minCols = config?.minSize?.cols ?? 1;
    const minRows = config?.minSize?.rows ?? 1;
    const maxCols = config?.maxSize?.cols ?? options.columns();
    const maxRows = config?.maxSize?.rows ?? 100;

    const clampedCols = Math.max(minCols, Math.min(maxCols, pendingCols));
    const clampedRows = Math.max(minRows, Math.min(maxRows, pendingRows));

    setResizeState({ cardId, cols: clampedCols, rows: clampedRows });
  };

  const onResizeMove = (e: PointerEvent) => {
    if (!resizeSession) return;

    const dx = e.clientX - resizeSession.startPointerX;
    const dy = e.clientY - resizeSession.startPointerY;
    const { dCol, dRow } = snapToGrid(dx, dy, resizeSession.cellW, resizeSession.cellH);

    resizeSession.pendingCols = resizeSession.startCols + dCol;
    resizeSession.pendingRows = resizeSession.startRows + dRow;

    if (resizeSession.rafId === null) {
      resizeSession.rafId = requestAnimationFrame(flushResize);
    }
  };

  const onResizeEnd = () => {
    if (!resizeSession) return;

    if (resizeSession.rafId !== null) {
      cancelAnimationFrame(resizeSession.rafId);
      resizeSession.rafId = null;
    }

    const rs = resizeState();
    if (rs && rs.cardId === resizeSession.cardId) {
      options.onResize(rs.cardId, rs.cols, rs.rows);
    }

    setResizeState(null);
    document.removeEventListener('pointermove', onResizeMove);
    document.removeEventListener('pointerup', onResizeEnd);
    resizeSession = null;
  };

  const handleResizeStart = (cardId: string, e: PointerEvent) => {
    const currentLayout = options.layout.find((l) => l.id === cardId);
    if (!currentLayout) return;

    const { cellW, cellH } = getCellSize();

    resizeSession = {
      cardId,
      pointerId: e.pointerId,
      containerEl: options.containerRef(),
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startCols: currentLayout.cols,
      startRows: currentLayout.rows,
      cellW,
      cellH,
      rafId: null,
      pendingCols: currentLayout.cols,
      pendingRows: currentLayout.rows,
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    document.addEventListener('pointermove', onResizeMove);
    document.addEventListener('pointerup', onResizeEnd);
  };

  onCleanup(() => {
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', onDragEnd);
    document.removeEventListener('pointermove', onResizeMove);
    document.removeEventListener('pointerup', onResizeEnd);

    if (dragSession?.rafId !== null && dragSession?.rafId != null) {
      cancelAnimationFrame(dragSession.rafId);
    }
    if (resizeSession?.rafId !== null && resizeSession?.rafId != null) {
      cancelAnimationFrame(resizeSession.rafId);
    }
  });

  return {
    dragState,
    resizeState,
    handleDragStart,
    handleResizeStart,
  };
}
