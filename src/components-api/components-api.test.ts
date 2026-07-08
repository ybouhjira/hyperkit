import { describe, it, expect } from 'vitest';
import {
  getAllComponents,
  getComponent,
  getCategory,
  searchComponents,
  type ComponentMetadata,
} from './index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Assert that a value is a well-formed ComponentMetadata object. */
function assertValidMetadata(c: ComponentMetadata): void {
  expect(typeof c.name).toBe('string');
  expect(c.name.length).toBeGreaterThan(0);
  expect(typeof c.path).toBe('string');
  expect(['primitive', 'composite']).toContain(c.type);
  expect(typeof c.description).toBe('string');
  expect(Array.isArray(c.props)).toBe(true);
  expect(Array.isArray(c.exports)).toBe(true);
  expect(typeof c.hasTests).toBe('boolean');
  expect(typeof c.hasStories).toBe('boolean');
  expect(Array.isArray(c.cssTokens)).toBe(true);
  expect(typeof c.variants).toBe('object');
}

// ---------------------------------------------------------------------------
// getAllComponents
// ---------------------------------------------------------------------------

describe('getAllComponents', () => {
  it('returns a non-empty array', () => {
    const all = getAllComponents();
    expect(all.length).toBeGreaterThan(0);
  });

  it('contains at least 90 components', () => {
    // COMPONENTS.json ships with 95 entries at time of writing.
    // This bound gives room for future additions without needing to update this test.
    expect(getAllComponents().length).toBeGreaterThanOrEqual(90);
  });

  it('returns a new array on each call (not a mutable reference)', () => {
    const a = getAllComponents();
    const b = getAllComponents();
    expect(a).not.toBe(b);
  });

  it('every entry has a valid ComponentMetadata shape', () => {
    for (const c of getAllComponents()) {
      assertValidMetadata(c);
    }
  });

  it('includes known components — Button, Accordion, ChatWindow', () => {
    const names = getAllComponents().map((c) => c.name);
    expect(names).toContain('Button');
    expect(names).toContain('Accordion');
    expect(names).toContain('ChatWindow');
  });
});

// ---------------------------------------------------------------------------
// getComponent
// ---------------------------------------------------------------------------

describe('getComponent', () => {
  it('returns the correct component for an exact name', () => {
    const result = getComponent('Button');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Button');
  });

  it('returns the correct metadata for a composite component', () => {
    const result = getComponent('ChatWindow');
    expect(result).toBeDefined();
    expect(result?.type).toBe('composite');
  });

  it('returns undefined for an unknown name', () => {
    expect(getComponent('NonExistentWidget')).toBeUndefined();
  });

  it('is case-sensitive — lowercase does not match', () => {
    expect(getComponent('button')).toBeUndefined();
  });

  it('returns a component with a non-empty description', () => {
    const badge = getComponent('Badge');
    expect(badge?.description.length).toBeGreaterThan(0);
  });

  it('returns correct cssTokens for Accordion', () => {
    const accordion = getComponent('Accordion');
    expect(accordion).toBeDefined();
    expect(accordion?.cssTokens).toContain('--sk-accent');
  });

  it('returns a component with variant metadata when variants exist', () => {
    const badge = getComponent('Badge');
    expect(badge?.variants).toBeDefined();
    expect(badge?.variants['variant']).toContain('success');
  });
});

// ---------------------------------------------------------------------------
// getCategory
// ---------------------------------------------------------------------------

describe('getCategory', () => {
  it('returns only primitives when queried with "primitive"', () => {
    const primitives = getCategory('primitive');
    expect(primitives.length).toBeGreaterThan(0);
    for (const c of primitives) {
      expect(c.type).toBe('primitive');
    }
  });

  it('returns only composites when queried with "composite"', () => {
    const composites = getCategory('composite');
    expect(composites.length).toBeGreaterThan(0);
    for (const c of composites) {
      expect(c.type).toBe('composite');
    }
  });

  it('primitives + composites covers all components', () => {
    const total = getAllComponents().length;
    const primitives = getCategory('primitive').length;
    const composites = getCategory('composite').length;
    expect(primitives + composites).toBe(total);
  });

  it('returns an empty array for an unknown category', () => {
    expect(getCategory('unknown')).toHaveLength(0);
    expect(getCategory('')).toHaveLength(0);
  });

  it('returns a new array on each call', () => {
    const a = getCategory('primitive');
    const b = getCategory('primitive');
    expect(a).not.toBe(b);
  });

  it('includes Button and Badge in primitives', () => {
    const names = getCategory('primitive').map((c) => c.name);
    expect(names).toContain('Button');
    expect(names).toContain('Badge');
  });

  it('includes ChatWindow in composites', () => {
    const names = getCategory('composite').map((c) => c.name);
    expect(names).toContain('ChatWindow');
  });
});

// ---------------------------------------------------------------------------
// searchComponents
// ---------------------------------------------------------------------------

describe('searchComponents', () => {
  it('returns all components for an empty query', () => {
    expect(searchComponents('').length).toBe(getAllComponents().length);
    expect(searchComponents('   ').length).toBe(getAllComponents().length);
  });

  it('finds "Button" by exact name query', () => {
    const results = searchComponents('Button');
    const names = results.map((c) => c.name);
    expect(names).toContain('Button');
  });

  it('search is case-insensitive', () => {
    const lower = searchComponents('button');
    const upper = searchComponents('BUTTON');
    const mixed = searchComponents('BuTtOn');

    expect(lower.map((c) => c.name)).toContain('Button');
    expect(upper.map((c) => c.name)).toContain('Button');
    expect(mixed.map((c) => c.name)).toContain('Button');
  });

  it('matches on description text', () => {
    // "Collapsible" description contains "Collapsible component"
    const results = searchComponents('Collapsible component');
    expect(results.length).toBeGreaterThan(0);
    const names = results.map((c) => c.name);
    expect(names).toContain('Collapsible');
  });

  it('matches on type/category', () => {
    const results = searchComponents('composite');
    expect(results.length).toBeGreaterThan(0);
    for (const c of results) {
      expect(c.type).toBe('composite');
    }
  });

  it('returns empty array for a query that matches nothing', () => {
    expect(searchComponents('zzzzzzzznotacomponent')).toHaveLength(0);
  });

  it('partial name matches work — "Chat" matches ChatWindow, LLMChatBox, etc.', () => {
    const results = searchComponents('Chat');
    const names = results.map((c) => c.name);
    expect(names).toContain('ChatWindow');
    expect(names).toContain('LLMChatBox');
  });

  it('returns a new array on each call', () => {
    const a = searchComponents('Button');
    const b = searchComponents('Button');
    expect(a).not.toBe(b);
  });

  it('all returned entries are valid ComponentMetadata', () => {
    for (const c of searchComponents('input')) {
      assertValidMetadata(c);
    }
  });
});
