import type { Graph, LayoutResult } from '@ybouhjira/diagram-core';
import { renderDiagram } from './renderer';
import { lightTheme, THEME_VARS, type DiagramTheme } from './themes';

export interface SvgExportOptions {
  /** Extra space around content bounds. Default: 40 */
  padding?: number;
  /** Theme applied to the exported SVG. Default: lightTheme */
  theme?: DiagramTheme;
  /** Render dot-grid background. Default: false */
  includeGrid?: boolean;
  /** Explicit background color, overrides theme background */
  backgroundColor?: string;
}

export interface PngExportOptions extends SvgExportOptions {
  /** Pixel scale multiplier (2 = retina). Default: 2 */
  scale?: number;
  /** Cap output width, scaling down proportionally if exceeded */
  maxWidth?: number;
}

/**
 * Build a `var(--sk-diagram-*)` → concrete value map from a DiagramTheme.
 *
 * `applyDiagramTheme` maps theme keys to THEME_VARS values, so we inverse-map
 * here to get `{ '--sk-diagram-bg': '#ffffff', ... }`.
 */
const buildVarMap = (theme: DiagramTheme): Map<string, string> => {
  const map = new Map<string, string>();
  for (const [themeKey, cssVar] of Object.entries(THEME_VARS)) {
    const value = theme[themeKey];
    if (value !== undefined) {
      map.set(cssVar, value);
    }
  }
  return map;
};

/**
 * Replace every `var(--sk-diagram-...)` occurrence in a CSS text string with
 * the concrete value from the theme map.  Fallback values inside `var()` are
 * used when the variable is not present in the map.
 *
 * Handles:
 *   var(--sk-diagram-bg, #ffffff)   →  #ffffff  (from theme, or fallback)
 *   var(--sk-diagram-bg)            →  #ffffff  (from theme, no fallback)
 */
const inlineCssVars = (css: string, varMap: Map<string, string>): string => {
  return css.replace(
    /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\s*\)/g,
    (_match: string, varName: string, fallback?: string): string => {
      const resolved = varMap.get(varName.trim());
      if (resolved !== undefined) return resolved;
      if (fallback !== undefined) return fallback.trim();
      return _match; // leave as-is when nothing resolves
    }
  );
};

/**
 * Export a diagram as a self-contained SVG string.
 *
 * All CSS variables are inlined so the SVG renders correctly without a host
 * DOM environment (e.g. in Node.js, Figma, email clients, etc.).
 */
export const exportSvg = <ND, ED>(
  graph: Graph<ND, ED>,
  layout: LayoutResult,
  options: SvgExportOptions = {}
): string => {
  const {
    padding = 40,
    theme = lightTheme,
    includeGrid = false,
    backgroundColor,
  } = options;

  // Derive content size from layout bounds + padding
  const contentWidth = layout.bounds.width + padding * 2;
  const contentHeight = layout.bounds.height + padding * 2;

  const svg = renderDiagram(graph, layout, {
    width: contentWidth,
    height: contentHeight,
    padding,
    showGrid: includeGrid,
  });

  // Set standalone SVG attributes
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  svg.setAttribute('width', String(contentWidth));
  svg.setAttribute('height', String(contentHeight));

  // Build variable resolution map from theme
  const varMap = buildVarMap(theme);

  // Override background color when explicitly provided
  if (backgroundColor !== undefined) {
    varMap.set(THEME_VARS.background, backgroundColor);
  }

  // Inline CSS variables in the <style> block so exported SVG is standalone
  const styleEl = svg.querySelector('style');
  if (styleEl?.textContent) {
    styleEl.textContent = inlineCssVars(styleEl.textContent, varMap);
  }

  // Also inline on the SVG element's own style attribute (applied by applyDiagramTheme)
  const svgStyle = svg.getAttribute('style');
  if (svgStyle) {
    svg.setAttribute('style', inlineCssVars(svgStyle, varMap));
  }

  return svg.outerHTML;
};

/**
 * Export a diagram as a PNG Blob at the requested pixel density.
 *
 * Browser-only: requires `document` and `HTMLCanvasElement`.
 * Rejects with a descriptive error in non-browser environments.
 */
export const exportPng = <ND, ED>(
  graph: Graph<ND, ED>,
  layout: LayoutResult,
  options: PngExportOptions = {}
): Promise<Blob> => {
  if (typeof document === 'undefined') {
    return Promise.reject(
      new Error('exportPng requires a browser environment (document is not defined)')
    );
  }

  const { scale = 2, maxWidth } = options;
  const svgString = exportSvg(graph, layout, options);

  const { padding = 40 } = options;
  const naturalWidth = layout.bounds.width + padding * 2;
  const naturalHeight = layout.bounds.height + padding * 2;

  // Compute output dimensions respecting scale and optional maxWidth cap
  let outputWidth = naturalWidth * scale;
  let outputHeight = naturalHeight * scale;
  if (maxWidth !== undefined && outputWidth > maxWidth) {
    const ratio = maxWidth / outputWidth;
    outputWidth = maxWidth;
    outputHeight = Math.round(outputHeight * ratio);
  }

  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    img.width = outputWidth;
    img.height = outputHeight;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get 2D canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('canvas.toBlob returned null'));
          }
        },
        'image/png'
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load SVG as image for PNG export'));
    };

    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  });
};
