import { describe, it, expect } from 'vitest';
import { resolveSlot, extendSlotMap, DEFAULT_SLOT_MAP } from './slot-map';
import type { Kind, Shape } from './types';

const ALL_KINDS: Kind[] = [
  'title',
  'subtitle',
  'media',
  'status',
  'metric',
  'rating',
  'tag',
  'person',
  'specs',
  'timestamp',
  'content',
  'identifier',
  'geo',
  'preview',
  'attachment',
];

const ALL_SHAPES: Shape[] = [
  'detail',
  'card',
  'row',
  'table',
  'board',
  'timeline',
  'pin',
  'compact-card',
];

describe('DEFAULT_SLOT_MAP', () => {
  it('has entries for all 15 kinds', () => {
    for (const kind of ALL_KINDS) {
      expect(DEFAULT_SLOT_MAP[kind]).toBeDefined();
    }
  });

  it('has entries for all 8 shapes per kind', () => {
    for (const kind of ALL_KINDS) {
      for (const shape of ALL_SHAPES) {
        expect(DEFAULT_SLOT_MAP[kind][shape]).toBeDefined();
      }
    }
  });

  it('has 120 total mappings (15 × 8)', () => {
    let count = 0;
    for (const kind of ALL_KINDS) {
      for (const shape of ALL_SHAPES) {
        count++;
      }
    }
    expect(count).toBe(120);
  });
});

describe('resolveSlot', () => {
  // Test specific known mappings from the design doc
  it('title × card → card-title', () => {
    expect(resolveSlot('title', 'card')).toBe('card-title');
  });

  it('title × detail → hero-heading', () => {
    expect(resolveSlot('title', 'detail')).toBe('hero-heading');
  });

  it('title × row → row-primary', () => {
    expect(resolveSlot('title', 'row')).toBe('row-primary');
  });

  it('title × pin → tooltip', () => {
    expect(resolveSlot('title', 'pin')).toBe('tooltip');
  });

  it('status × board → column-key', () => {
    expect(resolveSlot('status', 'board')).toBe('column-key');
  });

  it('metric × pin → pin-label', () => {
    expect(resolveSlot('metric', 'pin')).toBe('pin-label');
  });

  it('timestamp × timeline → axis-position', () => {
    expect(resolveSlot('timestamp', 'timeline')).toBe('axis-position');
  });

  // Test hidden mappings
  it('content × pin → hidden', () => {
    expect(resolveSlot('content', 'pin')).toBe('hidden');
  });

  it('media × board → hidden', () => {
    expect(resolveSlot('media', 'board')).toBe('hidden');
  });

  it('identifier × card → hidden', () => {
    expect(resolveSlot('identifier', 'card')).toBe('hidden');
  });

  it('specs × row → hidden', () => {
    expect(resolveSlot('specs', 'row')).toBe('hidden');
  });

  it('content × row → hidden', () => {
    expect(resolveSlot('content', 'row')).toBe('hidden');
  });

  // Test with custom slot map
  it('uses custom slot map when provided', () => {
    const custom = extendSlotMap(DEFAULT_SLOT_MAP, {
      title: { card: 'hero-heading' },
    });
    expect(resolveSlot('title', 'card', custom)).toBe('hero-heading');
  });
});

describe('extendSlotMap', () => {
  it('overrides specific cells', () => {
    const extended = extendSlotMap(DEFAULT_SLOT_MAP, {
      title: { card: 'hero-heading' },
    });
    expect(extended.title.card).toBe('hero-heading');
  });

  it('preserves non-overridden cells', () => {
    const extended = extendSlotMap(DEFAULT_SLOT_MAP, {
      title: { card: 'hero-heading' },
    });
    // Other title shapes preserved
    expect(extended.title.detail).toBe('hero-heading'); // original value
    expect(extended.title.row).toBe('row-primary');
    // Other kinds entirely preserved
    expect(extended.status.card).toBe('card-badge');
  });

  it('can override multiple kinds', () => {
    const extended = extendSlotMap(DEFAULT_SLOT_MAP, {
      title: { pin: 'pin-label' },
      status: { pin: 'tooltip' },
    });
    expect(extended.title.pin).toBe('pin-label');
    expect(extended.status.pin).toBe('tooltip');
  });

  it('can hide previously visible slots', () => {
    const extended = extendSlotMap(DEFAULT_SLOT_MAP, {
      title: { card: 'hidden' },
    });
    expect(extended.title.card).toBe('hidden');
  });

  it('does not mutate the base map', () => {
    const originalCardTitle = DEFAULT_SLOT_MAP.title.card;
    extendSlotMap(DEFAULT_SLOT_MAP, {
      title: { card: 'hero-heading' },
    });
    expect(DEFAULT_SLOT_MAP.title.card).toBe(originalCardTitle);
  });
});

describe('progressive disclosure pattern', () => {
  // Verify the design pattern: smaller views = fewer visible fields
  it('detail shows the most fields (no hidden)', () => {
    const hiddenInDetail = ALL_KINDS.filter((k) => resolveSlot(k, 'detail') === 'hidden');
    expect(hiddenInDetail).toHaveLength(0);
  });

  it('pin shows the fewest fields', () => {
    const visibleInPin = ALL_KINDS.filter((k) => resolveSlot(k, 'pin') !== 'hidden');
    expect(visibleInPin.length).toBeLessThanOrEqual(5);
  });

  it('compact-card shows fewer fields than card', () => {
    const visibleInCard = ALL_KINDS.filter((k) => resolveSlot(k, 'card') !== 'hidden');
    const visibleInCompact = ALL_KINDS.filter(
      (k) => resolveSlot(k, 'compact-card') !== 'hidden'
    );
    expect(visibleInCompact.length).toBeLessThan(visibleInCard.length);
  });

  it('card shows fewer fields than detail', () => {
    const visibleInDetail = ALL_KINDS.filter((k) => resolveSlot(k, 'detail') !== 'hidden');
    const visibleInCard = ALL_KINDS.filter((k) => resolveSlot(k, 'card') !== 'hidden');
    expect(visibleInCard.length).toBeLessThan(visibleInDetail.length);
  });
});
