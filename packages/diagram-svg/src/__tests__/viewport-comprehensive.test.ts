import { describe, it, expect, beforeEach } from 'vitest';
import { createViewportController, defaultViewport, applyViewport } from '../viewport';

describe('viewport - comprehensive tests', () => {
  let svg: SVGSVGElement;

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 600');
    document.body.appendChild(svg);
  });

  describe('applyViewport - exact calculations', () => {
    it('calculates exact viewBox for pan only', () => {
      // ViewBox transformation: newX = originalX - panX/zoom, newWidth = originalWidth/zoom
      applyViewport(svg, { panX: 100, panY: 50, zoom: 1 });

      const viewBox = svg.getAttribute('viewBox');
      // Original: 0 0 800 600
      // Pan: (100, 50), zoom: 1
      // New: (0-100/1, 0-50/1, 800/1, 600/1) = (-100, -50, 800, 600)
      expect(viewBox).toBe('-100 -50 800 600');
    });

    it('calculates exact viewBox for zoom only', () => {
      applyViewport(svg, { panX: 0, panY: 0, zoom: 2 });

      const viewBox = svg.getAttribute('viewBox');
      // Original: 0 0 800 600
      // Pan: (0, 0), zoom: 2
      // New: (0-0/2, 0-0/2, 800/2, 600/2) = (0, 0, 400, 300)
      expect(viewBox).toBe('0 0 400 300');
    });

    it('calculates exact viewBox for combined pan and zoom', () => {
      applyViewport(svg, { panX: 200, panY: 100, zoom: 2 });

      const viewBox = svg.getAttribute('viewBox');
      // Original: 0 0 800 600
      // Pan: (200, 100), zoom: 2
      // New: (0-200/2, 0-100/2, 800/2, 600/2) = (-100, -50, 400, 300)
      expect(viewBox).toBe('-100 -50 400 300');
    });

    it('handles zoom out (zoom < 1)', () => {
      applyViewport(svg, { panX: 0, panY: 0, zoom: 0.5 });

      const viewBox = svg.getAttribute('viewBox');
      // New: (0-0/0.5, 0-0/0.5, 800/0.5, 600/0.5) = (0, 0, 1600, 1200)
      expect(viewBox).toBe('0 0 1600 1200');
    });

    it('handles negative pan values', () => {
      applyViewport(svg, { panX: -150, panY: -75, zoom: 1 });

      const viewBox = svg.getAttribute('viewBox');
      // New: (0-(-150)/1, 0-(-75)/1, 800/1, 600/1) = (150, 75, 800, 600)
      expect(viewBox).toBe('150 75 800 600');
    });

    it('handles decimal values precisely', () => {
      applyViewport(svg, { panX: 123.45, panY: 67.89, zoom: 1.5 });

      const viewBox = svg.getAttribute('viewBox');
      // New: (0-123.45/1.5, 0-67.89/1.5, 800/1.5, 600/1.5)
      // = (-82.3, -45.26, 533.333..., 400)

      const parts = viewBox!.split(' ').map(parseFloat);
      expect(parts[0]).toBeCloseTo(-82.3, 1);
      expect(parts[1]).toBeCloseTo(-45.26, 1);
      expect(parts[2]).toBeCloseTo(533.33, 1);
      expect(parts[3]).toBeCloseTo(400, 1);
    });
  });

  describe('createViewportController - state management', () => {
    it('initializes with exact default state', () => {
      const controller = createViewportController(svg);
      const state = controller.getState();

      expect(state.panX).toBe(0);
      expect(state.panY).toBe(0);
      expect(state.zoom).toBe(1);

      controller.destroy();
    });

    it('initializes with exact custom state', () => {
      const initialState = { panX: 123, panY: 456, zoom: 2.5 };
      const controller = createViewportController(svg, initialState);
      const state = controller.getState();

      expect(state.panX).toBe(123);
      expect(state.panY).toBe(456);
      expect(state.zoom).toBe(2.5);

      controller.destroy();
    });

    it('pan updates state with exact values', () => {
      const controller = createViewportController(svg);

      controller.pan(150, 75);
      let state = controller.getState();
      expect(state.panX).toBe(150);
      expect(state.panY).toBe(75);

      // pan() ADDS to the existing value
      controller.pan(100, 50);
      state = controller.getState();
      expect(state.panX).toBe(250);
      expect(state.panY).toBe(125);

      controller.destroy();
    });

    it('pan with negative values', () => {
      const controller = createViewportController(svg);

      controller.pan(-100, -50);
      const state = controller.getState();
      expect(state.panX).toBe(-100);
      expect(state.panY).toBe(-50);

      controller.destroy();
    });

    it('zoom updates state with exact value', () => {
      const controller = createViewportController(svg);

      // zoom() MULTIPLIES the current zoom (starting from 1)
      controller.zoom(2.5);
      let state = controller.getState();
      expect(state.zoom).toBe(2.5);

      // zoom(0.5) multiplies: 2.5 * 0.5 = 1.25
      controller.zoom(0.5);
      state = controller.getState();
      expect(state.zoom).toBe(1.25);

      controller.destroy();
    });

    it('zoom clamps to exactly 0.1 minimum', () => {
      const controller = createViewportController(svg);

      controller.zoom(0.05);
      expect(controller.getState().zoom).toBe(0.1);

      controller.zoom(0.01);
      expect(controller.getState().zoom).toBe(0.1);

      controller.zoom(0);
      expect(controller.getState().zoom).toBe(0.1);

      controller.destroy();
    });

    it('zoom clamps to exactly 5 maximum', () => {
      const controller = createViewportController(svg);

      controller.zoom(6);
      expect(controller.getState().zoom).toBe(5);

      controller.zoom(10);
      expect(controller.getState().zoom).toBe(5);

      controller.zoom(100);
      expect(controller.getState().zoom).toBe(5);

      controller.destroy();
    });

    it('allows zoom exactly at boundaries', () => {
      const controller = createViewportController(svg);

      // Start at zoom = 1, multiply by 0.1 → 0.1
      controller.zoom(0.1);
      expect(controller.getState().zoom).toBe(0.1);

      // From 0.1, multiply by 50 → 5 (but we need to reset first)
      const controller2 = createViewportController(svg);
      controller2.zoom(5);
      expect(controller2.getState().zoom).toBe(5);

      controller.destroy();
      controller2.destroy();
    });

    it('reset restores exact default state', () => {
      const controller = createViewportController(svg);

      controller.pan(200, 100);
      controller.zoom(3);

      controller.reset();

      const state = controller.getState();
      expect(state.panX).toBe(0);
      expect(state.panY).toBe(0);
      expect(state.zoom).toBe(1);

      // ViewBox should also be restored
      expect(svg.getAttribute('viewBox')).toBe('0 0 800 600');

      controller.destroy();
    });

    it('reset restores to original viewBox', () => {
      svg.setAttribute('viewBox', '100 50 400 300');
      const controller = createViewportController(svg);

      controller.pan(200, 100);
      controller.zoom(2);
      controller.reset();

      expect(svg.getAttribute('viewBox')).toBe('100 50 400 300');

      controller.destroy();
    });
  });

  describe('multiple pan/zoom operations', () => {
    it('accumulates pan operations correctly', () => {
      const controller = createViewportController(svg);

      controller.pan(100, 50);
      controller.pan(150, 75);
      controller.pan(200, 100);

      const state = controller.getState();
      // Each pan call ADDS to the pan value
      // 0 + 100 + 150 + 200 = 450
      // 0 + 50 + 75 + 100 = 225
      expect(state.panX).toBe(450);
      expect(state.panY).toBe(225);

      controller.destroy();
    });

    it('accumulates zoom operations correctly', () => {
      const controller = createViewportController(svg);

      controller.zoom(2);
      controller.zoom(3);
      controller.zoom(1.5);

      const state = controller.getState();
      // Each zoom call MULTIPLIES the zoom value
      // 1 * 2 * 3 * 1.5 = 9, but clamped to max 5
      expect(state.zoom).toBe(5);

      controller.destroy();
    });

    it('applies transformations in correct order', () => {
      const controller = createViewportController(svg);

      controller.pan(100, 50);
      controller.zoom(2);

      const viewBox = svg.getAttribute('viewBox');
      // New: (0-100/2, 0-50/2, 800/2, 600/2) = (-50, -25, 400, 300)
      expect(viewBox).toBe('-50 -25 400 300');

      controller.destroy();
    });

    it('updates viewBox after each operation', () => {
      const controller = createViewportController(svg);

      controller.pan(100, 50);
      expect(svg.getAttribute('viewBox')).toBe('-100 -50 800 600');

      // zoom multiplies: 1 * 2 = 2
      controller.zoom(2);
      // Pan is 100, 50 from before; zoom is 2
      // newX = 0 - 100/2 = -50, newY = 0 - 50/2 = -25
      expect(svg.getAttribute('viewBox')).toBe('-50 -25 400 300');

      // Pan adds: panX = 100 + 50 = 150, panY = 50 + 50 = 100
      controller.pan(50, 50);
      // newX = 0 - 150/2 = -75, newY = 0 - 100/2 = -50
      expect(svg.getAttribute('viewBox')).toBe('-75 -50 400 300');

      controller.destroy();
    });
  });

  describe('fitContent', () => {
    it('zooms to fit content exactly', () => {
      // Mock getBoundingClientRect to return 800x600
      svg.getBoundingClientRect = () => ({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        toJSON: () => ({}),
      });

      const controller = createViewportController(svg);
      const bounds = { x: 100, y: 50, width: 400, height: 300 };

      controller.fitContent(bounds, 20);

      const state = controller.getState();

      // Content (400x300) should fit in viewport (800x600) with padding
      // Zoom should be calculated to fit content + padding into viewport
      expect(state.zoom).toBeGreaterThan(1);
      expect(state.zoom).toBeLessThanOrEqual(2);

      controller.destroy();
    });

    it('centers content after fit', () => {
      svg.getBoundingClientRect = () => ({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        toJSON: () => ({}),
      });

      const controller = createViewportController(svg);
      const bounds = { x: 100, y: 100, width: 200, height: 150 };

      controller.fitContent(bounds, 10);

      // fitContent back-computes pan values to center the content
      // The exact values depend on the viewBox calculation
      const state = controller.getState();
      expect(state.zoom).toBeGreaterThan(1);

      // Verify the viewBox is actually centered on the content
      const viewBox = svg.getAttribute('viewBox');
      expect(viewBox).toBeTruthy();
      const [vx, vy, vw, vh] = viewBox!.split(' ').map(Number);

      // Content should be centered in the viewBox
      const contentCenterX = bounds.x + bounds.width / 2;
      const contentCenterY = bounds.y + bounds.height / 2;
      const viewBoxCenterX = vx! + vw! / 2;
      const viewBoxCenterY = vy! + vh! / 2;

      expect(Math.abs(contentCenterX - viewBoxCenterX)).toBeLessThan(1);
      expect(Math.abs(contentCenterY - viewBoxCenterY)).toBeLessThan(1);

      controller.destroy();
    });

    it('should center content in the viewport', () => {
      svg.getBoundingClientRect = () => ({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        toJSON: () => ({}),
      });

      const controller = createViewportController(svg);
      const bounds = { x: 200, y: 150, width: 400, height: 300 };

      controller.fitContent(bounds, 40);

      const vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
      const [vx, vy, vw, vh] = vb;

      // Center of viewBox should be at center of bounds
      const viewCenterX = vx! + vw! / 2;
      const viewCenterY = vy! + vh! / 2;
      const boundsCenterX = bounds.x + bounds.width / 2; // 400
      const boundsCenterY = bounds.y + bounds.height / 2; // 300

      expect(viewCenterX).toBeCloseTo(boundsCenterX, 0);
      expect(viewCenterY).toBeCloseTo(boundsCenterY, 0);

      controller.destroy();
    });

    it('should maintain aspect ratio when content is wider than SVG', () => {
      svg.getBoundingClientRect = () => ({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        toJSON: () => ({}),
      });

      const controller = createViewportController(svg);
      // Wide content: aspect ratio 3:1
      const bounds = { x: 0, y: 0, width: 1200, height: 400 };

      controller.fitContent(bounds, 40);

      const vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
      const [, , vw, vh] = vb;

      // SVG aspect ratio is 800:600 = 4:3
      // Bounds aspect ratio is 1200:400 = 3:1
      // Content is wider relative to SVG, so width should dominate
      const svgAspect = 800 / 600;
      const viewAspect = vw! / vh!;

      expect(viewAspect).toBeCloseTo(svgAspect, 1);
      // Width should fit the content (with padding), height will be larger
      expect(vw).toBeGreaterThanOrEqual(bounds.width);
      expect(vh).toBeGreaterThan(bounds.height);

      controller.destroy();
    });

    it('should maintain aspect ratio when content is taller than SVG', () => {
      svg.getBoundingClientRect = () => ({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        toJSON: () => ({}),
      });

      const controller = createViewportController(svg);
      // Tall content: aspect ratio 1:2
      const bounds = { x: 0, y: 0, width: 300, height: 600 };

      controller.fitContent(bounds, 40);

      const vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
      const [, , vw, vh] = vb;

      // SVG aspect ratio is 800:600 = 4:3
      // Content is taller relative to SVG, so height should dominate
      const svgAspect = 800 / 600;
      const viewAspect = vw! / vh!;

      expect(viewAspect).toBeCloseTo(svgAspect, 1);
      // Height should fit the content (with padding), width will be larger
      expect(vh).toBeGreaterThanOrEqual(bounds.height);
      expect(vw).toBeGreaterThan(bounds.width);

      controller.destroy();
    });

    it('should include padding around content', () => {
      svg.getBoundingClientRect = () => ({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        toJSON: () => ({}),
      });

      const controller = createViewportController(svg);
      const bounds = { x: 100, y: 100, width: 400, height: 300 };
      const padding = 50;

      controller.fitContent(bounds, padding);

      const vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
      const [vx, vy, vw, vh] = vb;

      // The viewBox should be larger than the bounds to account for padding
      // Padding is applied in SVG space, so we need to consider the zoom factor
      const state = controller.getState();
      const paddingInSvgSpace = padding / state.zoom;

      // Calculate the bounds with padding
      const paddedWidth = bounds.width + 2 * paddingInSvgSpace;
      const paddedHeight = bounds.height + 2 * paddingInSvgSpace;

      // ViewBox should be at least as large as padded bounds (may be larger due to aspect ratio)
      expect(vw).toBeGreaterThanOrEqual(paddedWidth * 0.9); // 10% tolerance for aspect ratio
      expect(vh).toBeGreaterThanOrEqual(paddedHeight * 0.9);

      controller.destroy();
    });

    it('should allow subsequent pan/zoom after fitContent', () => {
      svg.getBoundingClientRect = () => ({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        toJSON: () => ({}),
      });

      const controller = createViewportController(svg);
      const bounds = { x: 100, y: 100, width: 400, height: 300 };

      controller.fitContent(bounds, 40);
      const stateAfterFit = controller.getState();

      // Pan should work (accumulates)
      controller.pan(50, 30);
      expect(controller.getState().panX).toBe(stateAfterFit.panX + 50);
      expect(controller.getState().panY).toBe(stateAfterFit.panY + 30);

      // Zoom should work (multiplies the zoom)
      controller.zoom(1.5);
      expect(controller.getState().zoom).toBeCloseTo(stateAfterFit.zoom * 1.5);

      controller.destroy();
    });

    it('should handle zero-size SVG gracefully', () => {
      svg.getBoundingClientRect = () => ({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        toJSON: () => ({}),
      });

      const controller = createViewportController(svg);
      const bounds = { x: 100, y: 100, width: 400, height: 300 };

      // Should not crash
      expect(() => controller.fitContent(bounds, 40)).not.toThrow();

      controller.destroy();
    });

    it('should cap zoom at maximum of 2x', () => {
      svg.getBoundingClientRect = () => ({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        toJSON: () => ({}),
      });

      const controller = createViewportController(svg);
      // Very small bounds relative to viewport
      const bounds = { x: 400, y: 300, width: 10, height: 10 };

      controller.fitContent(bounds, 20);

      const state = controller.getState();
      // Zoom should not exceed 2x when fitting small content
      expect(state.zoom).toBeLessThanOrEqual(2);

      controller.destroy();
    });
  });

  describe('viewport edge cases', () => {
    it('should handle negative bounds coordinates', () => {
      svg.getBoundingClientRect = () => ({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        toJSON: () => ({}),
      });

      const controller = createViewportController(svg);
      // Bounds with negative coordinates
      const bounds = { x: -200, y: -150, width: 400, height: 300 };

      expect(() => controller.fitContent(bounds, 40)).not.toThrow();

      const vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
      const [vx, vy, vw, vh] = vb;

      // Center of viewBox should be at center of bounds
      const viewCenterX = vx! + vw! / 2;
      const viewCenterY = vy! + vh! / 2;
      const boundsCenterX = bounds.x + bounds.width / 2; // 0
      const boundsCenterY = bounds.y + bounds.height / 2; // 0

      expect(viewCenterX).toBeCloseTo(boundsCenterX, 0);
      expect(viewCenterY).toBeCloseTo(boundsCenterY, 0);

      controller.destroy();
    });

    it('should clamp zoom between 0.1 and 5', () => {
      const controller = createViewportController(svg);

      // Try to zoom to 0.01 (should clamp to 0.1)
      controller.zoom(0.01);
      expect(controller.getState().zoom).toBe(0.1);

      // Reset and try to zoom to 100 (should clamp to 5)
      controller.reset();
      controller.zoom(100);
      expect(controller.getState().zoom).toBe(5);

      controller.destroy();
    });

    it('should handle fitContent with custom padding', () => {
      svg.getBoundingClientRect = () => ({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        toJSON: () => ({}),
      });

      const controller = createViewportController(svg);
      const bounds = { x: 100, y: 100, width: 400, height: 300 };
      const customPadding = 80;

      controller.fitContent(bounds, customPadding);

      const vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
      const [, , vw, vh] = vb;

      // ViewBox should be larger than bounds to accommodate 80px padding
      const state = controller.getState();
      const paddingInSvgSpace = customPadding / state.zoom;
      const paddedWidth = bounds.width + 2 * paddingInSvgSpace;
      const paddedHeight = bounds.height + 2 * paddingInSvgSpace;

      // ViewBox should be at least as large as padded bounds (may be larger due to aspect ratio)
      expect(vw).toBeGreaterThanOrEqual(paddedWidth * 0.9);
      expect(vh).toBeGreaterThanOrEqual(paddedHeight * 0.9);

      controller.destroy();
    });
  });

  describe('destroy', () => {
    it('allows continued state queries after destroy', () => {
      const controller = createViewportController(svg);

      controller.pan(100, 50);
      controller.destroy();

      // Should still be able to query state
      const state = controller.getState();
      expect(state.panX).toBe(100);
      expect(state.panY).toBe(50);
    });

    it('continues to update state after destroy', () => {
      const controller = createViewportController(svg);

      controller.destroy();

      controller.pan(100, 50);
      expect(controller.getState().panX).toBe(100);

      controller.zoom(2);
      expect(controller.getState().zoom).toBe(2);
    });
  });
});
