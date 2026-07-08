import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@solidjs/testing-library';
import { IssueMap } from '../src/components/IssueMap/IssueMap';
import type { IssueData } from '../src/components/IssueMap/types';
import { resolveParts } from '../src/components/IssueMap/parts';
import {
  issueMapAnatomy,
  minimalPreset,
  compactPreset,
  dashboardPreset,
} from '../src/components/IssueMap/presets';

const TEST_ISSUES: IssueData[] = [
  {
    id: 'test-1',
    number: 1,
    title: 'Test Issue 1',
    status: 'active',
    progress: { done: 1, total: 3 },
    dependsOn: [],
    layer: 'Core',
    project: 'test',
  },
  {
    id: 'test-2',
    number: 2,
    title: 'Test Issue 2',
    status: 'pending',
    progress: { done: 0, total: 2 },
    dependsOn: ['test-1'],
    layer: 'Features',
    project: 'test',
  },
];

describe('IssueMap Parts System', () => {
  describe('resolveParts', () => {
    it('should enable all parts by default', () => {
      const resolved = resolveParts(issueMapAnatomy);

      expect(resolved.root.enabled).toBe(true);
      expect(resolved.switcher.enabled).toBe(true);
      expect(resolved.graph.enabled).toBe(true);
      expect(resolved.nodeNumber.enabled).toBe(true);
      expect(resolved.nodeBadge.enabled).toBe(true);
      expect(resolved.nodeTitle.enabled).toBe(true);
      expect(resolved.nodeProjectLabel.enabled).toBe(true);
      expect(resolved.nodeProgressBar.enabled).toBe(true);
      expect(resolved.zoomControls.enabled).toBe(true);
      expect(resolved.layerGroups.enabled).toBe(true);
    });

    it('should apply minimal preset correctly', () => {
      const resolved = resolveParts(issueMapAnatomy, minimalPreset);

      expect(resolved.root.enabled).toBe(true);
      expect(resolved.switcher.enabled).toBe(false);
      expect(resolved.graph.enabled).toBe(true);
      expect(resolved.nodeNumber.enabled).toBe(true);
      expect(resolved.nodeBadge.enabled).toBe(false);
      expect(resolved.nodeTitle.enabled).toBe(true);
      expect(resolved.nodeProjectLabel.enabled).toBe(false);
      expect(resolved.nodeProgressBar.enabled).toBe(false);
      expect(resolved.zoomControls.enabled).toBe(false);
      expect(resolved.layerGroups.enabled).toBe(false);
    });

    it('should apply compact preset correctly', () => {
      const resolved = resolveParts(issueMapAnatomy, compactPreset);

      expect(resolved.nodeProgressBar.enabled).toBe(false);
      expect(resolved.nodeProjectLabel.enabled).toBe(false);
      expect(resolved.layerGroups.enabled).toBe(false);
      expect(resolved.nodeBadge.enabled).toBe(true);
      expect(resolved.nodeTitle.enabled).toBe(true);
    });

    it('should apply dashboard preset correctly', () => {
      const resolved = resolveParts(issueMapAnatomy, dashboardPreset);

      expect(resolved.switcher.enabled).toBe(false);
      expect(resolved.zoomControls.enabled).toBe(false);
      expect(resolved.nodeProjectLabel.enabled).toBe(false);
    });

    it('should allow overrides on top of presets', () => {
      const resolved = resolveParts(
        issueMapAnatomy,
        minimalPreset,
        { nodeBadge: { enabled: true } } // Override preset to enable badge
      );

      expect(resolved.nodeBadge.enabled).toBe(true);
      expect(resolved.switcher.enabled).toBe(false); // Still false from preset
    });

    it('should support false shorthand for disabling parts', () => {
      const resolved = resolveParts(issueMapAnatomy, undefined, {
        zoomControls: false,
        nodeProgressBar: false,
      });

      expect(resolved.zoomControls.enabled).toBe(false);
      expect(resolved.nodeProgressBar.enabled).toBe(false);
      expect(resolved.nodeTitle.enabled).toBe(true);
    });

    it('should merge styles from preset and overrides', () => {
      const resolved = resolveParts(issueMapAnatomy, undefined, {
        root: {
          style: { 'background-color': 'red' },
        },
      });

      expect(resolved.root.style['background-color']).toBe('red');
    });
  });

  describe('IssueMap component with presets', () => {
    it('should render with full preset (default)', () => {
      const { container } = render(() => (
        <div style={{ width: '800px', height: '600px' }}>
          <IssueMap issues={TEST_ISSUES} preset="full" />
        </div>
      ));

      expect(container.querySelector('button')).toBeTruthy(); // Switcher tabs
    });

    it('should render with minimal preset', () => {
      const { container } = render(() => (
        <div style={{ width: '800px', height: '600px' }}>
          <IssueMap issues={TEST_ISSUES} preset="minimal" />
        </div>
      ));

      // No switcher in minimal preset
      const switcherTabs = container.querySelector('[style*="border-bottom"]');
      expect(switcherTabs).toBeFalsy();
    });

    it('should accept part overrides', () => {
      const { container } = render(() => (
        <div style={{ width: '800px', height: '600px' }}>
          <IssueMap issues={TEST_ISSUES} preset="full" parts={{ switcher: false }} />
        </div>
      ));

      // Switcher disabled by override even though preset is full
      const switcherTabs = container.querySelector('[style*="border-bottom"]');
      expect(switcherTabs).toBeFalsy();
    });

    it('should maintain backward compatibility with config prop', async () => {
      const { container } = render(() => (
        <div style={{ width: '800px', height: '600px' }}>
          <IssueMap issues={TEST_ISSUES} config={{ groupBy: 'layer', showGrid: true }} />
        </div>
      ));

      // The diagram SVG appears once the async layout pass has completed
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeTruthy();
      });
    });
  });
});
