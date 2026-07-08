import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerContentType,
  getContentType,
  getDefaultPanel,
  getPanelsForContentType,
  getAllContentTypes,
  clearContentTypes,
} from './ContentRegistry';

describe('ContentRegistry', () => {
  beforeEach(() => {
    clearContentTypes();
  });

  describe('registerContentType', () => {
    it('registers a content type', () => {
      registerContentType({
        type: 'test-type',
        label: 'Test Type',
        defaultPanel: 'test-panel',
      });
      expect(getContentType('test-type')).toBeDefined();
      expect(getContentType('test-type')!.label).toBe('Test Type');
    });

    it('overwrites existing content type', () => {
      registerContentType({
        type: 'test-type',
        label: 'Original',
        defaultPanel: 'panel-a',
      });
      registerContentType({
        type: 'test-type',
        label: 'Updated',
        defaultPanel: 'panel-b',
      });
      expect(getContentType('test-type')!.label).toBe('Updated');
      expect(getContentType('test-type')!.defaultPanel).toBe('panel-b');
    });
  });

  describe('getContentType', () => {
    it('returns undefined for unregistered type', () => {
      expect(getContentType('nonexistent')).toBeUndefined();
    });
  });

  describe('getDefaultPanel', () => {
    it('returns default panel for registered type', () => {
      registerContentType({
        type: 'file',
        label: 'File',
        defaultPanel: 'file-viewer',
      });
      expect(getDefaultPanel('file')).toBe('file-viewer');
    });

    it('returns undefined for unregistered type', () => {
      expect(getDefaultPanel('nonexistent')).toBeUndefined();
    });
  });

  describe('getPanelsForContentType', () => {
    it('returns default panel when no alternatives', () => {
      registerContentType({
        type: 'session',
        label: 'Session',
        defaultPanel: 'chat-window',
      });
      expect(getPanelsForContentType('session')).toEqual(['chat-window']);
    });

    it('returns default + alternative panels', () => {
      registerContentType({
        type: 'file',
        label: 'File',
        defaultPanel: 'file-viewer',
        alternativePanels: ['code-editor', 'hex-viewer'],
      });
      expect(getPanelsForContentType('file')).toEqual(['file-viewer', 'code-editor', 'hex-viewer']);
    });

    it('returns empty array for unregistered type', () => {
      expect(getPanelsForContentType('nonexistent')).toEqual([]);
    });
  });

  describe('getAllContentTypes', () => {
    it('returns empty array when none registered', () => {
      expect(getAllContentTypes()).toEqual([]);
    });

    it('returns all registered types', () => {
      registerContentType({ type: 'a', label: 'A', defaultPanel: 'p1' });
      registerContentType({ type: 'b', label: 'B', defaultPanel: 'p2' });
      const all = getAllContentTypes();
      expect(all).toHaveLength(2);
      expect(all.map((t) => t.type)).toContain('a');
      expect(all.map((t) => t.type)).toContain('b');
    });
  });

  describe('clearContentTypes', () => {
    it('clears all registrations', () => {
      registerContentType({ type: 'a', label: 'A', defaultPanel: 'p1' });
      registerContentType({ type: 'b', label: 'B', defaultPanel: 'p2' });
      clearContentTypes();
      expect(getAllContentTypes()).toEqual([]);
    });
  });
});
