import { describe, it, expect } from 'vitest';
import type { Slot } from './slot-map';
import {
  detectDataState,
  getSkeletonShape,
  skeletonClass,
  SKELETON_SHAPES,
  type SkeletonShape,
  type DataState,
} from './skeleton';

describe('detectDataState', () => {
  it('returns "loading" for undefined', () => {
    const result: DataState = detectDataState(undefined);
    expect(result).toBe('loading');
  });

  it('returns "empty" for null', () => {
    const result: DataState = detectDataState(null);
    expect(result).toBe('empty');
  });

  it('returns "error" for Error instance', () => {
    const result: DataState = detectDataState(new Error('test error'));
    expect(result).toBe('error');
  });

  it('returns "ready" for any other value', () => {
    expect(detectDataState('test')).toBe('ready');
    expect(detectDataState(42)).toBe('ready');
    expect(detectDataState(true)).toBe('ready');
    expect(detectDataState(false)).toBe('ready');
    expect(detectDataState(0)).toBe('ready');
    expect(detectDataState('')).toBe('ready');
    expect(detectDataState([])).toBe('ready');
    expect(detectDataState({})).toBe('ready');
  });
});

describe('getSkeletonShape', () => {
  it('returns correct shape for detail slots', () => {
    expect(getSkeletonShape('hero-heading')).toBe('text-long');
    expect(getSkeletonShape('section-heading')).toBe('text-medium');
    expect(getSkeletonShape('hero-image')).toBe('block');
    expect(getSkeletonShape('status-badge')).toBe('pill');
    expect(getSkeletonShape('stat-block')).toBe('text-short');
    expect(getSkeletonShape('star-display')).toBe('bar');
    expect(getSkeletonShape('tag-list')).toBe('pill');
    expect(getSkeletonShape('avatar-card')).toBe('circle');
    expect(getSkeletonShape('spec-grid')).toBe('text-medium');
    expect(getSkeletonShape('date-display')).toBe('text-short');
    expect(getSkeletonShape('rich-text')).toBe('text-long');
    expect(getSkeletonShape('breadcrumb')).toBe('text-medium');
    expect(getSkeletonShape('map-embed')).toBe('block');
    expect(getSkeletonShape('preview-block')).toBe('block');
    expect(getSkeletonShape('file-list')).toBe('bar');
  });

  it('returns correct shape for card slots', () => {
    expect(getSkeletonShape('card-title')).toBe('text-long');
    expect(getSkeletonShape('card-subtitle')).toBe('text-medium');
    expect(getSkeletonShape('card-cover')).toBe('block');
    expect(getSkeletonShape('card-badge')).toBe('pill');
    expect(getSkeletonShape('card-metric')).toBe('text-short');
    expect(getSkeletonShape('card-stars')).toBe('bar');
    expect(getSkeletonShape('card-tags')).toBe('pill');
    expect(getSkeletonShape('card-avatar')).toBe('circle');
    expect(getSkeletonShape('card-spec-row')).toBe('text-medium');
    expect(getSkeletonShape('card-time')).toBe('text-short');
    expect(getSkeletonShape('card-excerpt')).toBe('text-long');
    expect(getSkeletonShape('card-location')).toBe('text-medium');
    expect(getSkeletonShape('card-preview')).toBe('square');
    expect(getSkeletonShape('card-attachment-count')).toBe('icon');
    expect(getSkeletonShape('card-tag-dots')).toBe('dot');
  });

  it('returns correct shape for row slots', () => {
    expect(getSkeletonShape('row-primary')).toBe('text-long');
    expect(getSkeletonShape('row-secondary')).toBe('text-medium');
    expect(getSkeletonShape('row-thumb')).toBe('square');
    expect(getSkeletonShape('row-badge')).toBe('pill');
    expect(getSkeletonShape('row-metric')).toBe('text-short');
    expect(getSkeletonShape('row-stars')).toBe('bar');
    expect(getSkeletonShape('row-tag-first')).toBe('pill');
    expect(getSkeletonShape('row-avatar')).toBe('circle');
    expect(getSkeletonShape('row-time')).toBe('text-short');
    expect(getSkeletonShape('row-id')).toBe('text-short');
    expect(getSkeletonShape('row-location')).toBe('text-medium');
    expect(getSkeletonShape('row-preview')).toBe('square');
    expect(getSkeletonShape('row-clip-icon')).toBe('icon');
  });

  it('returns correct shape for cell slots', () => {
    expect(getSkeletonShape('cell-text')).toBe('text-medium');
    expect(getSkeletonShape('cell-thumb')).toBe('square');
    expect(getSkeletonShape('cell-badge')).toBe('pill');
    expect(getSkeletonShape('cell-number')).toBe('text-short');
    expect(getSkeletonShape('cell-stars')).toBe('bar');
    expect(getSkeletonShape('cell-tags')).toBe('pill');
    expect(getSkeletonShape('cell-avatar')).toBe('circle');
    expect(getSkeletonShape('cell-date')).toBe('text-short');
    expect(getSkeletonShape('cell-id')).toBe('text-short');
    expect(getSkeletonShape('cell-icon')).toBe('icon');
  });

  it('returns correct shape for board/timeline/pin slots', () => {
    expect(getSkeletonShape('column-key')).toBe('text-medium');
    expect(getSkeletonShape('event-label')).toBe('text-long');
    expect(getSkeletonShape('event-sub')).toBe('text-medium');
    expect(getSkeletonShape('bar-color')).toBe('bar');
    expect(getSkeletonShape('bar-width')).toBe('bar');
    expect(getSkeletonShape('axis-position')).toBe('text-short');
    expect(getSkeletonShape('tooltip')).toBe('text-medium');
    expect(getSkeletonShape('pin-color')).toBe('dot');
    expect(getSkeletonShape('pin-label')).toBe('text-short');
    expect(getSkeletonShape('pin-position')).toBe('dot');
    expect(getSkeletonShape('badge')).toBe('pill');
  });

  it('returns "text-medium" for unknown slots', () => {
    expect(getSkeletonShape('unknown-slot')).toBe('text-medium');
    expect(getSkeletonShape('not-a-slot')).toBe('text-medium');
    expect(getSkeletonShape('')).toBe('text-medium');
  });
});

describe('skeletonClass', () => {
  it('returns correct class string for known slots', () => {
    expect(skeletonClass('hero-heading')).toBe('sk-skeleton sk-skeleton--text-long');
    expect(skeletonClass('card-avatar')).toBe('sk-skeleton sk-skeleton--circle');
    expect(skeletonClass('row-badge')).toBe('sk-skeleton sk-skeleton--pill');
    expect(skeletonClass('cell-icon')).toBe('sk-skeleton sk-skeleton--icon');
  });

  it('returns fallback class for unknown slots', () => {
    expect(skeletonClass('unknown-slot')).toBe('sk-skeleton sk-skeleton--text-medium');
  });
});

describe('SKELETON_SHAPES mapping', () => {
  it('has exactly 64 slot mappings', () => {
    const slotCount = Object.keys(SKELETON_SHAPES).length;
    expect(slotCount).toBe(64);
  });

  it('maps all non-hidden slots from Slot type', () => {
    // All slots from slot-map.ts except 'hidden'
    const allSlots: Slot[] = [
      // detail slots
      'hero-heading',
      'section-heading',
      'hero-image',
      'status-badge',
      'stat-block',
      'star-display',
      'tag-list',
      'avatar-card',
      'spec-grid',
      'date-display',
      'rich-text',
      'breadcrumb',
      'map-embed',
      'preview-block',
      'file-list',
      // card slots
      'card-title',
      'card-subtitle',
      'card-cover',
      'card-badge',
      'card-metric',
      'card-stars',
      'card-tags',
      'card-avatar',
      'card-spec-row',
      'card-time',
      'card-excerpt',
      'card-location',
      'card-preview',
      'card-attachment-count',
      'card-tag-dots',
      // row slots
      'row-primary',
      'row-secondary',
      'row-thumb',
      'row-badge',
      'row-metric',
      'row-stars',
      'row-tag-first',
      'row-avatar',
      'row-time',
      'row-id',
      'row-location',
      'row-preview',
      'row-clip-icon',
      // cell slots
      'cell-text',
      'cell-thumb',
      'cell-badge',
      'cell-number',
      'cell-stars',
      'cell-tags',
      'cell-avatar',
      'cell-date',
      'cell-id',
      'cell-icon',
      // board/timeline/pin
      'column-key',
      'event-label',
      'event-sub',
      'bar-color',
      'bar-width',
      'axis-position',
      'tooltip',
      'pin-color',
      'pin-label',
      'pin-position',
      'badge',
    ];

    // Verify every slot has a mapping
    allSlots.forEach((slot) => {
      expect(SKELETON_SHAPES[slot]).toBeDefined();
      expect(SKELETON_SHAPES[slot]).toMatch(
        /^(text-long|text-short|text-medium|pill|circle|block|square|bar|dot|icon)$/
      );
    });
  });

  it('uses every SkeletonShape value at least once', () => {
    const allShapes: SkeletonShape[] = [
      'text-long',
      'text-short',
      'text-medium',
      'pill',
      'circle',
      'block',
      'square',
      'bar',
      'dot',
      'icon',
    ];

    const usedShapes = new Set(Object.values(SKELETON_SHAPES));

    allShapes.forEach((shape) => {
      expect(usedShapes.has(shape)).toBe(true);
    });
  });

  it('only uses valid SkeletonShape values', () => {
    const validShapes: SkeletonShape[] = [
      'text-long',
      'text-short',
      'text-medium',
      'pill',
      'circle',
      'block',
      'square',
      'bar',
      'dot',
      'icon',
    ];

    Object.values(SKELETON_SHAPES).forEach((shape) => {
      expect(validShapes).toContain(shape);
    });
  });
});
