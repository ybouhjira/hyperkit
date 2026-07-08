import { describe, it, expect, beforeEach } from 'vitest';
import { createViewportController } from '../viewport';

// Test the full zoom-in/zoom-out/fitContent/reset cycle
describe('Controls integration - viewport actions', () => {
  let svg: SVGSVGElement;
  let controller: ReturnType<typeof createViewportController>;

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 600');
    Object.defineProperty(svg, 'getBoundingClientRect', {
      value: () => ({
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        right: 800,
        bottom: 600,
        toJSON: () => ({}),
      }),
    });
    document.body.appendChild(svg);
    controller = createViewportController(svg);
  });

  it('zoom(1.2) should zoom in (increase zoom level)', () => {
    controller.zoom(1.2);
    expect(controller.getState().zoom).toBeCloseTo(1.2);
    // Verify viewBox got smaller (zoomed in)
    const vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
    expect(vb[2]).toBeLessThan(800); // width shrunk
  });

  it('zoom(0.8) should zoom out (decrease zoom level)', () => {
    controller.zoom(0.8);
    expect(controller.getState().zoom).toBeCloseTo(0.8);
    const vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
    expect(vb[2]).toBeGreaterThan(800); // width expanded
  });

  it('reset() should restore original viewBox', () => {
    controller.zoom(1.5);
    controller.pan(100, 50);
    controller.reset();
    expect(svg.getAttribute('viewBox')).toBe('0 0 800 600');
    expect(controller.getState().zoom).toBe(1);
    expect(controller.getState().panX).toBe(0);
    expect(controller.getState().panY).toBe(0);
  });

  it('fitContent should zoom and center on given bounds', () => {
    const bounds = { x: 100, y: 100, width: 400, height: 300 };
    controller.fitContent(bounds);

    const vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
    const [vx, vy, vw, vh] = vb;

    // Center of viewBox should be at center of bounds
    const viewCenterX = vx! + vw! / 2;
    const viewCenterY = vy! + vh! / 2;
    expect(viewCenterX).toBeCloseTo(100 + 400 / 2, 0); // 300
    expect(viewCenterY).toBeCloseTo(100 + 300 / 2, 0); // 250
  });

  it('sequential zoom calls should compound', () => {
    controller.zoom(1.2);
    controller.zoom(1.2);
    expect(controller.getState().zoom).toBeCloseTo(1.44);
  });

  it('pan then zoom should maintain pan offset', () => {
    controller.pan(100, 50);
    const stateBefore = controller.getState();
    controller.zoom(1.5);
    expect(controller.getState().panX).toBe(stateBefore.panX);
    expect(controller.getState().panY).toBe(stateBefore.panY);
  });

  it('destroy() should clean up without errors', () => {
    expect(() => controller.destroy()).not.toThrow();
  });

  it('fitContent then zoom should work correctly', () => {
    controller.fitContent({ x: 0, y: 0, width: 400, height: 300 });
    const stateAfterFit = controller.getState();

    controller.zoom(1.5);
    expect(controller.getState().zoom).toBeCloseTo(stateAfterFit.zoom * 1.5);
  });

  it('fitContent with large bounds should zoom out', () => {
    controller.fitContent({ x: 0, y: 0, width: 2000, height: 1500 });
    expect(controller.getState().zoom).toBeLessThan(1);
  });

  it('fitContent with tiny bounds should not exceed zoom cap', () => {
    controller.fitContent({ x: 0, y: 0, width: 10, height: 10 });
    expect(controller.getState().zoom).toBeLessThanOrEqual(2);
  });

  it('multiple pan operations should accumulate correctly', () => {
    controller.pan(50, 25);
    controller.pan(30, 15);
    expect(controller.getState().panX).toBe(80);
    expect(controller.getState().panY).toBe(40);
  });

  it('zoom out beyond minimum should clamp to 0.1', () => {
    controller.zoom(0.05);
    expect(controller.getState().zoom).toBe(0.1);
  });

  it('zoom in beyond maximum should clamp to 5', () => {
    controller.zoom(10);
    expect(controller.getState().zoom).toBe(5);
  });

  it('reset after multiple operations should restore all state', () => {
    controller.zoom(2);
    controller.pan(200, 100);
    controller.zoom(1.5);
    controller.pan(-50, 75);

    controller.reset();

    const state = controller.getState();
    expect(state.zoom).toBe(1);
    expect(state.panX).toBe(0);
    expect(state.panY).toBe(0);
    expect(svg.getAttribute('viewBox')).toBe('0 0 800 600');
  });

  it('fitContent with different aspect ratios should maintain SVG aspect', () => {
    // Wide content
    controller.fitContent({ x: 0, y: 0, width: 800, height: 200 });
    let vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
    let aspect = vb[2]! / vb[3]!;
    expect(aspect).toBeCloseTo(800 / 600, 1); // SVG aspect ratio

    // Tall content
    controller.reset();
    controller.fitContent({ x: 0, y: 0, width: 200, height: 800 });
    vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
    aspect = vb[2]! / vb[3]!;
    expect(aspect).toBeCloseTo(800 / 600, 1); // SVG aspect ratio
  });

  it('zoom changes viewBox dimensions but keeps same origin when pan is zero', () => {
    const initialVb = svg.getAttribute('viewBox')!.split(' ').map(Number);

    controller.zoom(2);

    const newVb = svg.getAttribute('viewBox')!.split(' ').map(Number);

    // When zoom = 2, viewBox dimensions are halved
    expect(newVb[2]).toBeCloseTo(initialVb[2]! / 2, 0); // width halved
    expect(newVb[3]).toBeCloseTo(initialVb[3]! / 2, 0); // height halved

    // Origin stays at (0, 0) when pan is zero
    expect(newVb[0]).toBe(0);
    expect(newVb[1]).toBe(0);
  });

  it('pan affects viewBox position correctly', () => {
    controller.pan(100, 50);

    const vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
    // Pan shifts the viewBox in the opposite direction
    expect(vb[0]).toBe(-100); // shifted left
    expect(vb[1]).toBe(-50); // shifted up
    expect(vb[2]).toBe(800); // width unchanged
    expect(vb[3]).toBe(600); // height unchanged
  });
});
