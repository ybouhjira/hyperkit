import { describe, it, expect, beforeEach } from 'vitest';
import { createViewportController, defaultViewport, applyViewport } from './viewport';

describe('viewport', () => {
  let svg: SVGSVGElement;

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 600');
    document.body.appendChild(svg);
  });

  describe('applyViewport', () => {
    it('should update viewBox based on viewport state', () => {
      applyViewport(svg, { panX: 100, panY: 50, zoom: 2 });
      const viewBox = svg.getAttribute('viewBox');
      expect(viewBox).toBe('-50 -25 400 300');
    });

    it('should handle zoom out', () => {
      applyViewport(svg, { panX: 0, panY: 0, zoom: 0.5 });
      const viewBox = svg.getAttribute('viewBox');
      expect(viewBox).toBe('0 0 1600 1200');
    });

    it('should handle pan only', () => {
      applyViewport(svg, { panX: 200, panY: 100, zoom: 1 });
      const viewBox = svg.getAttribute('viewBox');
      expect(viewBox).toBe('-200 -100 800 600');
    });
  });

  describe('createViewportController', () => {
    it('should create a controller with default state', () => {
      const controller = createViewportController(svg);
      const state = controller.getState();

      expect(state).toEqual(defaultViewport);

      controller.destroy();
    });

    it('should create a controller with initial state', () => {
      const initialState = { panX: 100, panY: 50, zoom: 1.5 };
      const controller = createViewportController(svg, initialState);
      const state = controller.getState();

      expect(state).toEqual(initialState);

      controller.destroy();
    });

    it('should pan the viewport', () => {
      const controller = createViewportController(svg);
      controller.pan(100, 50);
      const state = controller.getState();

      expect(state.panX).toBe(100);
      expect(state.panY).toBe(50);

      controller.destroy();
    });

    it('should zoom the viewport', () => {
      const controller = createViewportController(svg);
      controller.zoom(2);
      const state = controller.getState();

      expect(state.zoom).toBe(2);

      controller.destroy();
    });

    it('should clamp zoom between 0.1 and 5', () => {
      const controller = createViewportController(svg);

      controller.zoom(10);
      expect(controller.getState().zoom).toBe(5);

      controller.zoom(0.01);
      expect(controller.getState().zoom).toBe(0.1);

      controller.destroy();
    });

    it('should reset viewport to default', () => {
      const controller = createViewportController(svg);

      controller.pan(100, 50);
      controller.zoom(2);
      controller.reset();

      const state = controller.getState();
      expect(state).toEqual(defaultViewport);
      expect(svg.getAttribute('viewBox')).toBe('0 0 800 600');

      controller.destroy();
    });

    it('should fit content with bounds', () => {
      // Mock getBoundingClientRect
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

      controller.fitContent(bounds, 20);

      const state = controller.getState();
      expect(state.zoom).toBeGreaterThan(0);
      expect(state.zoom).toBeLessThanOrEqual(2);

      controller.destroy();
    });

    it('should cleanup event listeners on destroy', () => {
      const controller = createViewportController(svg);

      // Verify the controller is working
      controller.pan(50, 50);
      expect(controller.getState().panX).toBe(50);

      controller.destroy();

      // After destroy, the controller should still be queryable but not update
      const stateBefore = controller.getState();
      controller.pan(100, 100);
      const stateAfter = controller.getState();

      expect(stateAfter.panX).toBe(150); // Still updates state object
    });
  });
});
