import { describe, it, expect } from 'vitest';
import {
  defaultViewKit,
  createViewKit,
  ALL_KINDS,
  ALL_SHAPES,
  DEFAULT_REGISTRY,
  DEFAULT_LAYOUTS,
} from './view-kit';

describe('defaultViewKit', () => {
  it('has name "default"', () => {
    expect(defaultViewKit.name).toBe('default');
  });

  it('includes all 15 kinds', () => {
    expect(defaultViewKit.kinds).toHaveLength(15);
  });

  it('includes all 8 shapes', () => {
    expect(defaultViewKit.shapes).toHaveLength(8);
  });

  it('uses DEFAULT_SLOT_MAP', () => {
    expect(defaultViewKit.slotMap.title.card).toBe('card-title');
  });

  it('has registry entries for all non-hidden slots', () => {
    expect(Object.keys(defaultViewKit.registry).length).toBeGreaterThan(50);
  });

  it('has layout templates for all 8 shapes', () => {
    for (const shape of ALL_SHAPES) {
      expect(defaultViewKit.layouts[shape]).toBeDefined();
      expect(defaultViewKit.layouts[shape]!.shape).toBe(shape);
    }
  });
});

describe('DEFAULT_REGISTRY', () => {
  it('maps hero-heading to Heading', () => {
    expect(DEFAULT_REGISTRY['hero-heading']).toBe('Heading');
  });

  it('maps card-title to Text', () => {
    expect(DEFAULT_REGISTRY['card-title']).toBe('Text');
  });

  it('maps card-badge to Badge', () => {
    expect(DEFAULT_REGISTRY['card-badge']).toBe('Badge');
  });
});

describe('DEFAULT_LAYOUTS', () => {
  it('card layout has card slots in order', () => {
    const cardLayout = DEFAULT_LAYOUTS.card!;
    expect(cardLayout.className).toBe('sk-view-card');
    expect(cardLayout.slots[0]).toBe('card-cover');
    expect(cardLayout.slots[1]).toBe('card-title');
  });

  it('row layout has row slots', () => {
    const rowLayout = DEFAULT_LAYOUTS.row!;
    expect(rowLayout.className).toBe('sk-view-row');
    expect(rowLayout.slots).toContain('row-primary');
  });

  it('compact-card has minimal slots', () => {
    const compactLayout = DEFAULT_LAYOUTS['compact-card']!;
    expect(compactLayout.slots.length).toBeLessThanOrEqual(5);
  });
});

describe('createViewKit', () => {
  it('creates a new ViewKit with defaults', () => {
    const kit = createViewKit({ name: 'test' });
    expect(kit.name).toBe('test');
    expect(kit.kinds).toHaveLength(15);
    expect(kit.shapes).toHaveLength(8);
  });

  it('extends a base ViewKit', () => {
    const child = createViewKit({
      name: 'child',
      extends: defaultViewKit,
    });
    expect(child.name).toBe('child');
    expect(child.slotMap).toBe(defaultViewKit.slotMap);
    expect(child.registry).toEqual(defaultViewKit.registry);
  });

  it('overrides slot map entries', () => {
    const child = createViewKit({
      name: 'custom',
      extends: defaultViewKit,
      slotMapOverrides: {
        title: { card: 'hero-heading' },
      },
    });
    expect(child.slotMap.title.card).toBe('hero-heading');
    // Other entries preserved
    expect(child.slotMap.title.row).toBe('row-primary');
    expect(child.slotMap.status.card).toBe('card-badge');
  });

  it('overrides registry entries', () => {
    const child = createViewKit({
      name: 'custom',
      extends: defaultViewKit,
      registry: {
        'card-title': 'CustomTitle',
      },
    });
    expect(child.registry['card-title']).toBe('CustomTitle');
    // Other entries preserved
    expect(child.registry['card-badge']).toBe('Badge');
  });

  it('overrides layout templates', () => {
    const child = createViewKit({
      name: 'custom',
      extends: defaultViewKit,
      layouts: {
        card: {
          shape: 'card',
          slots: ['card-title', 'card-badge'],
          className: 'my-card',
        },
      },
    });
    expect(child.layouts.card!.className).toBe('my-card');
    expect(child.layouts.card!.slots).toHaveLength(2);
    // Other layouts preserved
    expect(child.layouts.row!.className).toBe('sk-view-row');
  });

  it('can restrict to subset of kinds', () => {
    const child = createViewKit({
      name: 'minimal',
      extends: defaultViewKit,
      kinds: ['title', 'status', 'metric'],
    });
    expect(child.kinds).toHaveLength(3);
  });

  it('can restrict to subset of shapes', () => {
    const child = createViewKit({
      name: 'cards-only',
      extends: defaultViewKit,
      shapes: ['card', 'compact-card'],
    });
    expect(child.shapes).toHaveLength(2);
  });

  it('without extends, uses defaults', () => {
    const kit = createViewKit({ name: 'standalone' });
    expect(kit.slotMap.title.card).toBe('card-title');
    expect(kit.registry['card-title']).toBeDefined();
  });
});

describe('ALL_KINDS', () => {
  it('has 15 entries', () => {
    expect(ALL_KINDS).toHaveLength(15);
  });
});

describe('ALL_SHAPES', () => {
  it('has 8 entries', () => {
    expect(ALL_SHAPES).toHaveLength(8);
  });
});
