import { describe, it, expect, beforeEach } from 'vitest';
import {
  identifyComponent,
  isSolidKitElement,
  getComponentLabel,
  describeBem,
  getRegisteredComponents,
} from '../src/engine/ComponentIdentifier';

function createElement(...classNames: string[]): HTMLElement {
  const el = document.createElement('div');
  el.className = classNames.join(' ');
  return el;
}

describe('ComponentIdentifier', () => {
  describe('identifyComponent', () => {
    it('identifies a Button with variant and size', () => {
      const el = createElement('sk-btn', 'sk-btn--primary', 'sk-btn--md');
      const result = identifyComponent(el);
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Button');
      expect(result!.variant).toBe('primary');
      expect(result!.size).toBe('md');
      expect(result!.subPart).toBeNull();
    });

    it('identifies a Card with variant', () => {
      const el = createElement('sk-card', 'sk-card--outlined');
      const result = identifyComponent(el);
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Card');
      expect(result!.variant).toBe('outlined');
      expect(result!.size).toBeNull();
    });

    it('identifies a sub-element', () => {
      const el = createElement('sk-card__header');
      const result = identifyComponent(el);
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Card');
      expect(result!.subPart).toBe('header');
    });

    it('returns null for non-SolidKit elements', () => {
      const el = createElement('my-component', 'another-class');
      expect(identifyComponent(el)).toBeNull();
    });

    it('identifies view shape classes', () => {
      const el = createElement('sk-view-card');
      const result = identifyComponent(el);
      expect(result).not.toBeNull();
      expect(result!.name).toBe('ViewCard');
    });

    it('identifies unknown sk-* components with formatted name', () => {
      const el = createElement('sk-custom-widget');
      const result = identifyComponent(el);
      expect(result).not.toBeNull();
      expect(result!.name).toBe('CustomWidget');
    });

    it('identifies parent component', () => {
      const parent = createElement('sk-card');
      const child = createElement('sk-card__header');
      parent.appendChild(child);
      document.body.appendChild(parent);

      const result = identifyComponent(child);
      expect(result!.parentComponent).toBe('Card');

      document.body.removeChild(parent);
    });

    it('formats unknown parent component blocks', () => {
      const parent = createElement('sk-zzz-unknown');
      const child = createElement('sk-card');
      parent.appendChild(child);
      document.body.appendChild(parent);

      const result = identifyComponent(child);
      expect(result!.parentComponent).toBe('ZzzUnknown');

      document.body.removeChild(parent);
    });

    it('returns a null subPart for a dangling element separator', () => {
      const el = createElement('sk-card__');
      const result = identifyComponent(el);
      expect(result!.name).toBe('Card');
      expect(result!.subPart).toBeNull();
    });
  });

  describe('isSolidKitElement', () => {
    it('returns true for sk-* elements', () => {
      const el = createElement('sk-btn');
      expect(isSolidKitElement(el)).toBe(true);
    });

    it('returns false for non-sk elements', () => {
      const el = createElement('my-btn');
      expect(isSolidKitElement(el)).toBe(false);
    });
  });

  describe('generated component map', () => {
    it('covers the full HyperKit catalog (300+ sk-blocks)', () => {
      const map = getRegisteredComponents();
      expect(Object.keys(map).length).toBeGreaterThanOrEqual(300);
    });

    it.each([
      ['sk-card', 'Card'],
      ['sk-empty-state', 'EmptyState'],
      ['sk-section', 'Section'],
      ['sk-timeline', 'Timeline'],
      ['sk-badge', 'Badge'],
      ['sk-btn', 'Button'],
      ['sk-kanban', 'KanbanBoard'],
      ['sk-cmd-palette', 'CommandPalette'],
      ['sk-metric', 'MetricCard'],
      ['sk-prose', 'Markdown'],
      ['sk-fe-toolbar', 'FileExplorer'],
      ['sk-panel-container', 'PanelContainer'],
      ['sk-resize-handle', 'PanelResizeHandle'],
      ['sk-report-hero', 'ReportHero'],
      ['sk-shortcuts-help', 'ShortcutsHelp'],
      ['sk-error-banner', 'ErrorBanner'],
      ['sk-progress-ring', 'ProgressRing'],
      ['sk-tag-input', 'TagInput'],
    ])('identifies %s as %s', (cls, name) => {
      const el = createElement(cls);
      expect(identifyComponent(el)!.name).toBe(name);
    });

    it('resolves the sk-dialog conflict to the Dialog primitive (not ThemePickerModal)', () => {
      const el = createElement('sk-dialog');
      expect(identifyComponent(el)!.name).toBe('Dialog');
    });
  });

  describe('describeBem', () => {
    it('breaks a full class list into block, elements, and modifiers', () => {
      const result = describeBem([
        'sk-card',
        'sk-card--outlined',
        'sk-card--md',
        'sk-card__header',
        'plan-card',
      ]);
      expect(result.block).toBe('sk-card');
      expect(result.name).toBe('Card');
      expect(result.isKnown).toBe(true);
      expect(result.elements).toEqual([{ name: 'header', raw: 'sk-card__header' }]);
      expect(result.modifiers).toEqual([
        { name: 'outlined', kind: 'variant', raw: 'sk-card--outlined' },
        { name: 'md', kind: 'size', raw: 'sk-card--md' },
      ]);
      expect(result.others).toEqual(['plan-card']);
    });

    it('classifies state and unknown modifiers', () => {
      const result = describeBem(['sk-tabs', 'sk-tabs--active', 'sk-tabs--vertical']);
      expect(result.modifiers).toEqual([
        { name: 'active', kind: 'state', raw: 'sk-tabs--active' },
        { name: 'vertical', kind: 'other', raw: 'sk-tabs--vertical' },
      ]);
    });

    it('extracts the element and modifier from a modified element class', () => {
      const result = describeBem(['sk-card__header--sticky']);
      expect(result.block).toBe('sk-card');
      expect(result.name).toBe('Card');
      expect(result.elements).toEqual([{ name: 'header', raw: 'sk-card__header--sticky' }]);
      expect(result.modifiers).toEqual([
        { name: 'sticky', kind: 'state', raw: 'sk-card__header--sticky' },
      ]);
    });

    it('derives the block from a modifier-only class list', () => {
      const result = describeBem(['sk-btn--primary']);
      expect(result.block).toBe('sk-btn');
      expect(result.name).toBe('Button');
      expect(result.modifiers).toEqual([
        { name: 'primary', kind: 'variant', raw: 'sk-btn--primary' },
      ]);
    });

    it('dedupes repeated elements and modifiers', () => {
      const result = describeBem([
        'sk-card__header',
        'sk-card__header',
        'sk-card__header--sticky',
        'sk-card--outlined',
        'sk-card--outlined',
      ]);
      expect(result.elements).toHaveLength(1);
      expect(result.modifiers).toEqual([
        { name: 'sticky', kind: 'state', raw: 'sk-card__header--sticky' },
        { name: 'outlined', kind: 'variant', raw: 'sk-card--outlined' },
      ]);
    });

    it('ignores dangling separators (empty element/modifier names)', () => {
      const result = describeBem(['sk-card', 'sk-card--', 'sk-card__']);
      expect(result.elements).toEqual([]);
      expect(result.modifiers).toEqual([]);
    });

    it('marks unknown sk-blocks as not known but still formats the name', () => {
      const result = describeBem(['sk-custom-widget']);
      expect(result.block).toBe('sk-custom-widget');
      expect(result.name).toBe('CustomWidget');
      expect(result.isKnown).toBe(false);
    });

    it('returns a null block for non-HyperKit class lists', () => {
      const result = describeBem(['plan-card', 'other']);
      expect(result.block).toBeNull();
      expect(result.name).toBeNull();
      expect(result.isKnown).toBe(false);
      expect(result.others).toEqual(['plan-card', 'other']);
    });
  });

  describe('getComponentLabel', () => {
    it('formats Button with variant and size', () => {
      const el = createElement('sk-btn', 'sk-btn--primary', 'sk-btn--md');
      const info = identifyComponent(el)!;
      expect(getComponentLabel(info)).toBe('Button (primary, md)');
    });

    it('formats Card with only variant', () => {
      const el = createElement('sk-card', 'sk-card--outlined');
      const info = identifyComponent(el)!;
      expect(getComponentLabel(info)).toBe('Card (outlined)');
    });

    it('formats sub-element as Parent > part', () => {
      const el = createElement('sk-card__header');
      const info = identifyComponent(el)!;
      expect(getComponentLabel(info)).toBe('Card > header');
    });

    it('formats component with no modifiers', () => {
      const el = createElement('sk-accordion');
      const info = identifyComponent(el)!;
      expect(getComponentLabel(info)).toBe('Accordion');
    });

    it('formats sub-element of an unknown block via class formatting', () => {
      const el = createElement('sk-zzz-unknown__part');
      const info = identifyComponent(el)!;
      expect(getComponentLabel(info)).toBe('ZzzUnknown > part');
    });

    it('falls back to the component name when no element class carries the part', () => {
      const el = createElement('sk-card');
      const info = identifyComponent(el)!;
      // Hand-built shape: a subPart without a matching __ class is possible
      // for callers constructing InspectedComponent directly.
      expect(getComponentLabel({ ...info, subPart: 'header' })).toBe('Card > header');
    });
  });
});
