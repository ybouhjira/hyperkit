import '@testing-library/jest-dom';

// Mock ResizeObserver (not available in jsdom)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock SVG APIs not available in jsdom
const mockSVGPoint = {
  x: 0,
  y: 0,
  matrixTransform(matrix: DOMMatrix) {
    return {
      x: this.x * matrix.a + this.y * matrix.c + matrix.e,
      y: this.x * matrix.b + this.y * matrix.d + matrix.f,
    };
  },
};

if (typeof SVGSVGElement !== 'undefined') {
  SVGSVGElement.prototype.createSVGPoint = function () {
    return { ...mockSVGPoint } as unknown as SVGPoint;
  };
  SVGSVGElement.prototype.getScreenCTM = function () {
    return new DOMMatrix([1, 0, 0, 1, 0, 0]);
  };
}
