import { describe, it, expect } from 'vitest';
import { mapSpace, mapTextColor, mapBg } from './utils';

describe('mapSpace', () => {
  it('returns raw "0" for the 0 token', () => {
    expect(mapSpace('0')).toBe('0');
  });

  it('maps "2xs" to --sk-space-2xs', () => {
    expect(mapSpace('2xs')).toBe('var(--sk-space-2xs)');
  });

  it('maps "xs" to --sk-space-xs', () => {
    expect(mapSpace('xs')).toBe('var(--sk-space-xs)');
  });

  it('maps "px" to --sk-space-px (backward compat)', () => {
    expect(mapSpace('px')).toBe('var(--sk-space-px)');
  });

  it('maps "md" to --sk-space-md', () => {
    expect(mapSpace('md')).toBe('var(--sk-space-md)');
  });
});

describe('mapTextColor', () => {
  it('maps primary to --sk-text-primary', () => {
    expect(mapTextColor('primary')).toBe('var(--sk-text-primary)');
  });

  it('maps on-accent to --sk-text-on-accent', () => {
    expect(mapTextColor('on-accent')).toBe('var(--sk-text-on-accent)');
  });

  it('maps error to --sk-error', () => {
    expect(mapTextColor('error')).toBe('var(--sk-error)');
  });

  it('maps success to --sk-success', () => {
    expect(mapTextColor('success')).toBe('var(--sk-success)');
  });

  it('maps warning to --sk-warning', () => {
    expect(mapTextColor('warning')).toBe('var(--sk-warning)');
  });

  it('maps info to --sk-info', () => {
    expect(mapTextColor('info')).toBe('var(--sk-info)');
  });
});

describe('mapBg', () => {
  it('maps primary to --sk-bg-primary', () => {
    expect(mapBg('primary')).toBe('var(--sk-bg-primary)');
  });

  it('maps secondary to --sk-bg-secondary', () => {
    expect(mapBg('secondary')).toBe('var(--sk-bg-secondary)');
  });

  it('maps tertiary to --sk-bg-tertiary', () => {
    expect(mapBg('tertiary')).toBe('var(--sk-bg-tertiary)');
  });

  it('maps elevated to --sk-bg-elevated', () => {
    expect(mapBg('elevated')).toBe('var(--sk-bg-elevated)');
  });

  it('maps transparent to raw transparent', () => {
    expect(mapBg('transparent')).toBe('transparent');
  });

  it('maps accent to --sk-accent', () => {
    expect(mapBg('accent')).toBe('var(--sk-accent)');
  });

  it('maps accent-muted to --sk-accent-muted', () => {
    expect(mapBg('accent-muted')).toBe('var(--sk-accent-muted)');
  });

  it('maps accent-subtle to --sk-accent-subtle', () => {
    expect(mapBg('accent-subtle')).toBe('var(--sk-accent-subtle)');
  });
});
