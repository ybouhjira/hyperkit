export interface ViewportState {
  readonly panX: number;
  readonly panY: number;
  readonly zoom: number;
}

export const defaultViewport: ViewportState = {
  panX: 0,
  panY: 0,
  zoom: 1,
};

export const applyViewport = (svg: SVGSVGElement, viewport: ViewportState): void => {
  const viewBox = svg.getAttribute('viewBox');
  if (!viewBox) return;
  const [ox, oy, ow, oh] = viewBox.split(' ').map(Number);
  if (ox === undefined || oy === undefined || ow === undefined || oh === undefined) return;

  const newWidth = ow / viewport.zoom;
  const newHeight = oh / viewport.zoom;
  const newX = ox - viewport.panX / viewport.zoom;
  const newY = oy - viewport.panY / viewport.zoom;

  svg.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
};

export interface ViewportController {
  readonly getState: () => ViewportState;
  readonly pan: (dx: number, dy: number) => void;
  readonly zoom: (factor: number, centerX?: number, centerY?: number) => void;
  readonly reset: () => void;
  readonly fitContent: (
    bounds: { x: number; y: number; width: number; height: number },
    padding?: number,
    minZoom?: number,
    animated?: boolean
  ) => void;
  readonly fitToSvgBounds: (padding?: number, minZoom?: number, animated?: boolean) => void;
  readonly destroy: () => void;
}

const PAN_THRESHOLD = 3; // pixels of movement before we consider it a drag

export const createViewportController = (
  svg: SVGSVGElement,
  initialState: ViewportState = defaultViewport
): ViewportController => {
  let state = { ...initialState };
  const originalViewBox = svg.getAttribute('viewBox') ?? '0 0 800 600';

  const update = (): void => {
    const [ox, oy, ow, oh] = originalViewBox.split(' ').map(Number);
    if (ox === undefined || oy === undefined || ow === undefined || oh === undefined) return;
    const newWidth = ow / state.zoom;
    const newHeight = oh / state.zoom;
    const newX = ox - state.panX / state.zoom;
    const newY = oy - state.panY / state.zoom;
    svg.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
  };

  // RAF batching — at most one viewBox write per animation frame
  let rafId: number | null = null;

  const scheduleUpdate = (): void => {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        update();
        rafId = null;
      });
    }
  };

  // Animate a viewBox transition using cubic ease-out interpolation.
  // The target is set synchronously first so getState() / getAttribute() always
  // reflect the final value immediately — the animation is purely visual.
  const animateViewBox = (fromViewBox: string, targetViewBox: string, duration = 300): void => {
    const fromVB = fromViewBox.split(' ').map(Number);
    const targetVB = targetViewBox.split(' ').map(Number);
    const startTime = performance.now();

    // Set final value synchronously so any code reading the viewBox after
    // fitContent() returns always gets the correct target value.
    svg.setAttribute('viewBox', targetViewBox);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);

      const vb = fromVB.map((from, i) => from + (targetVB[i]! - from) * ease);
      svg.setAttribute('viewBox', `${vb[0]} ${vb[1]} ${vb[2]} ${vb[3]}`);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure we land exactly on target at the end
        svg.setAttribute('viewBox', targetViewBox);
      }
    };

    requestAnimationFrame(animate);
  };

  // Mouse wheel zoom
  const onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, state.zoom * factor));

    // Zoom toward cursor position
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const zoomRatio = newZoom / state.zoom;

    state = {
      zoom: newZoom,
      panX: mouseX - (mouseX - state.panX) * zoomRatio,
      panY: mouseY - (mouseY - state.panY) * zoomRatio,
    };
    scheduleUpdate();
  };

  // Pan via mouse drag (left-click, middle-click, or Alt+click)
  let isPanning = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;

  const onMouseDown = (e: MouseEvent): void => {
    if (e.button === 0 || e.button === 1) {
      isPanning = true;
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      e.preventDefault();
    }
  };

  const onMouseMove = (e: MouseEvent): void => {
    if (!isPanning) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const totalDx = e.clientX - startX;
    const totalDy = e.clientY - startY;

    // Threshold check is immediate — no batching, so the cursor change is snappy
    if (!isDragging && Math.sqrt(totalDx * totalDx + totalDy * totalDy) > PAN_THRESHOLD) {
      isDragging = true;
      svg.style.cursor = 'grabbing';
    }

    if (isDragging) {
      state = { ...state, panX: state.panX + dx, panY: state.panY + dy };
      lastX = e.clientX;
      lastY = e.clientY;
      // Only the viewBox write is batched — state is already up-to-date
      scheduleUpdate();
    }
  };

  const onMouseUp = (e: MouseEvent): void => {
    if (isPanning && isDragging) {
      // Was a drag - prevent the click event from firing
      const preventClick = (clickEvent: Event): void => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        svg.removeEventListener('click', preventClick, true);
      };
      svg.addEventListener('click', preventClick, true);
      // Remove the listener after a tick in case click doesn't fire
      setTimeout(() => svg.removeEventListener('click', preventClick, true), 0);
    }
    isPanning = false;
    isDragging = false;
    svg.style.cursor = '';
  };

  svg.addEventListener('wheel', onWheel, { passive: false });
  svg.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  return {
    getState: () => ({ ...state }),
    pan: (dx, dy) => {
      state = { ...state, panX: state.panX + dx, panY: state.panY + dy };
      update();
    },
    zoom: (factor, centerX, centerY) => {
      const newZoom = Math.max(0.1, Math.min(5, state.zoom * factor));
      if (centerX !== undefined && centerY !== undefined) {
        // Zoom toward cursor: adjust pan so the point under the cursor stays fixed
        const zoomRatio = newZoom / state.zoom;
        state = {
          zoom: newZoom,
          panX: centerX - (centerX - state.panX) * zoomRatio,
          panY: centerY - (centerY - state.panY) * zoomRatio,
        };
      } else {
        state = { ...state, zoom: newZoom };
      }
      update();
    },
    reset: () => {
      state = { ...defaultViewport };
      svg.setAttribute('viewBox', originalViewBox);
    },
    fitContent: (bounds, padding = 40, minZoom = 0.25, animated = true) => {
      const svgRect = svg.getBoundingClientRect();
      if (svgRect.width === 0 || svgRect.height === 0) return;

      const contentWidth = bounds.width + padding * 2;
      const contentHeight = bounds.height + padding * 2;

      // Maintain SVG element aspect ratio
      const svgAspect = svgRect.width / svgRect.height;
      const contentAspect = contentWidth / contentHeight;

      let viewWidth: number, viewHeight: number;
      if (contentAspect > svgAspect) {
        // Content is wider than SVG - fit to width
        viewWidth = contentWidth;
        viewHeight = contentWidth / svgAspect;
      } else {
        // Content is taller than SVG - fit to height
        viewHeight = contentHeight;
        viewWidth = contentHeight * svgAspect;
      }

      // Center on bounds
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      const viewX = centerX - viewWidth / 2;
      const viewY = centerY - viewHeight / 2;

      // Back-compute internal state from the update() inverse:
      // newWidth = ow / zoom  =>  zoom = ow / viewWidth
      // newX = ox - panX / zoom  =>  panX = (ox - viewX) * zoom
      const [ox, oy, ow] = originalViewBox.split(' ').map(Number);
      const newZoom = Math.min(ow! / viewWidth, 2);
      const clampedZoom = Math.max(newZoom, minZoom);

      const prevZoom = state.zoom;
      const prevViewBox = svg.getAttribute('viewBox') ?? originalViewBox;

      if (clampedZoom > newZoom) {
        // Zoom was capped — recalculate view dimensions at the capped zoom
        const cappedViewWidth = ow! / clampedZoom;
        const cappedViewHeight = (ow! / svgAspect) / clampedZoom;
        const cappedViewX = centerX - cappedViewWidth / 2;
        const cappedViewY = centerY - cappedViewHeight / 2;
        const targetViewBox = `${cappedViewX} ${cappedViewY} ${cappedViewWidth} ${cappedViewHeight}`;

        // State is set immediately so subsequent operations are correct
        state = {
          zoom: clampedZoom,
          panX: (ox! - cappedViewX) * clampedZoom,
          panY: (oy! - cappedViewY) * clampedZoom,
        };

        const zoomChangePct = Math.abs(clampedZoom - prevZoom) / (prevZoom || 1);
        if (animated && zoomChangePct > 0.05) {
          animateViewBox(prevViewBox, targetViewBox);
        } else {
          svg.setAttribute('viewBox', targetViewBox);
        }
      } else {
        const targetViewBox = `${viewX} ${viewY} ${viewWidth} ${viewHeight}`;

        // State is set immediately so subsequent operations are correct
        state = {
          zoom: newZoom,
          panX: (ox! - viewX) * newZoom,
          panY: (oy! - viewY) * newZoom,
        };

        const zoomChangePct = Math.abs(newZoom - prevZoom) / (prevZoom || 1);
        if (animated && zoomChangePct > 0.05) {
          animateViewBox(prevViewBox, targetViewBox);
        } else {
          svg.setAttribute('viewBox', targetViewBox);
        }
      }
    },
    fitToSvgBounds: (padding = 20, minZoom = 0.25, animated = true) => {
      const bbox = svg.getBBox();
      if (bbox.width === 0 || bbox.height === 0) return;
      // Reuse fitContent with actual SVG bounds
      const svgRect = svg.getBoundingClientRect();
      if (svgRect.width === 0 || svgRect.height === 0) return;

      const contentWidth = bbox.width + padding * 2;
      const contentHeight = bbox.height + padding * 2;

      const svgAspect = svgRect.width / svgRect.height;
      const contentAspect = contentWidth / contentHeight;

      let viewWidth: number, viewHeight: number;
      if (contentAspect > svgAspect) {
        viewWidth = contentWidth;
        viewHeight = contentWidth / svgAspect;
      } else {
        viewHeight = contentHeight;
        viewWidth = contentHeight * svgAspect;
      }

      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y + bbox.height / 2;
      const viewX = centerX - viewWidth / 2;
      const viewY = centerY - viewHeight / 2;

      // Back-compute internal state
      const ow = parseFloat(originalViewBox.split(' ')[2]!);
      const ox = parseFloat(originalViewBox.split(' ')[0]!);
      const oy = parseFloat(originalViewBox.split(' ')[1]!);
      const newZoom = ow / viewWidth;
      const clampedZoom = Math.max(newZoom, minZoom);
      const prevZoom = state.zoom;
      const prevViewBox = svg.getAttribute('viewBox') ?? originalViewBox;

      if (clampedZoom > newZoom) {
        // Zoom was capped — recalculate view dimensions at the capped zoom
        const cappedViewWidth = ow / clampedZoom;
        const cappedViewHeight = (ow / svgAspect) / clampedZoom;
        const cappedViewX = centerX - cappedViewWidth / 2;
        const cappedViewY = centerY - cappedViewHeight / 2;
        const targetViewBox = `${cappedViewX} ${cappedViewY} ${cappedViewWidth} ${cappedViewHeight}`;

        state = {
          zoom: clampedZoom,
          panX: (ox - cappedViewX) * clampedZoom,
          panY: (oy - cappedViewY) * clampedZoom,
        };

        const zoomChangePct = Math.abs(clampedZoom - prevZoom) / (prevZoom || 1);
        if (animated && zoomChangePct > 0.05) {
          animateViewBox(prevViewBox, targetViewBox);
        } else {
          svg.setAttribute('viewBox', targetViewBox);
        }
      } else {
        const targetViewBox = `${viewX} ${viewY} ${viewWidth} ${viewHeight}`;

        state = { panX: ox - viewX * newZoom, panY: oy - viewY * newZoom, zoom: newZoom };

        const zoomChangePct = Math.abs(newZoom - prevZoom) / (prevZoom || 1);
        if (animated && zoomChangePct > 0.05) {
          animateViewBox(prevViewBox, targetViewBox);
        } else {
          svg.setAttribute('viewBox', targetViewBox);
        }
      }
    },
    destroy: () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      svg.removeEventListener('wheel', onWheel);
      svg.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    },
  };
};
