import { describe, it, expect } from 'vitest';
import {
  resolveFieldState,
  isVisible,
  isInteractive,
  isCustomRender,
  fieldStateClass,
} from './field-state';
import type { ResolvedFieldState } from './field-state';

describe('resolveFieldState', () => {
  describe('explicit override (highest priority)', () => {
    it('false hides the field', () => {
      expect(resolveFieldState({
        override: false,
        intent: 'edit',
      })).toBe(false);
    });

    it('disabled grays the field', () => {
      expect(resolveFieldState({
        override: 'disabled',
        intent: 'edit',
      })).toBe('disabled');
    });

    it('readonly makes field non-editable', () => {
      expect(resolveFieldState({
        override: 'readonly',
        intent: 'edit',
      })).toBe('readonly');
    });

    it('function passes through as custom render', () => {
      const customFn = (value: unknown) => value;
      expect(resolveFieldState({
        override: customFn,
        intent: 'edit',
      })).toBe(customFn);
    });

    it('override takes priority over intent', () => {
      // Even in browse mode, explicit false hides
      expect(resolveFieldState({
        override: false,
        intent: 'browse',
      })).toBe(false);
    });

    it('override takes priority over can()', () => {
      // Even if can() would deny, explicit disabled wins
      const result = resolveFieldState({
        override: 'disabled',
        intent: 'edit',
        can: () => true,
        fieldName: 'title',
        item: {},
      });
      expect(result).toBe('disabled');
    });
  });

  describe('can() permission check', () => {
    it('forces readonly if can() denies edit in edit intent', () => {
      const result = resolveFieldState({
        intent: 'edit',
        can: (action) => action !== 'edit:title',
        fieldName: 'title',
        item: { id: 1 },
      });
      expect(result).toBe('readonly');
    });

    it('does not affect browse intent', () => {
      const result = resolveFieldState({
        intent: 'browse',
        can: () => false,
        fieldName: 'title',
        item: {},
      });
      // Browse default is readonly regardless of can()
      expect(result).toBe('readonly');
    });

    it('allows edit if can() permits', () => {
      const result = resolveFieldState({
        intent: 'edit',
        can: () => true,
        fieldName: 'title',
        item: {},
      });
      expect(result).toBe('default');
    });
  });

  describe('intent defaults', () => {
    it('browse → readonly', () => {
      expect(resolveFieldState({ intent: 'browse' })).toBe('readonly');
    });

    it('edit → default', () => {
      expect(resolveFieldState({ intent: 'edit' })).toBe('default');
    });

    it('pick → readonly', () => {
      expect(resolveFieldState({ intent: 'pick' })).toBe('readonly');
    });
  });
});

describe('isVisible', () => {
  it('false → not visible', () => {
    expect(isVisible(false)).toBe(false);
  });

  it('disabled → visible', () => {
    expect(isVisible('disabled')).toBe(true);
  });

  it('readonly → visible', () => {
    expect(isVisible('readonly')).toBe(true);
  });

  it('default → visible', () => {
    expect(isVisible('default')).toBe(true);
  });

  it('function → visible', () => {
    expect(isVisible((v: unknown) => v)).toBe(true);
  });
});

describe('isInteractive', () => {
  it('default → interactive', () => {
    expect(isInteractive('default')).toBe(true);
  });

  it('disabled → not interactive', () => {
    expect(isInteractive('disabled')).toBe(false);
  });

  it('readonly → not interactive', () => {
    expect(isInteractive('readonly')).toBe(false);
  });

  it('false → not interactive', () => {
    expect(isInteractive(false)).toBe(false);
  });

  it('function → not interactive', () => {
    expect(isInteractive((v: unknown) => v)).toBe(false);
  });
});

describe('isCustomRender', () => {
  it('function → true', () => {
    const fn = (v: unknown) => v;
    expect(isCustomRender(fn)).toBe(true);
  });

  it('false → false', () => {
    expect(isCustomRender(false)).toBe(false);
  });

  it('string → false', () => {
    expect(isCustomRender('disabled' as ResolvedFieldState)).toBe(false);
  });

  it('default → false', () => {
    expect(isCustomRender('default')).toBe(false);
  });
});

describe('fieldStateClass', () => {
  it('false → sk-field--hidden', () => {
    expect(fieldStateClass(false)).toBe('sk-field--hidden');
  });

  it('disabled → sk-field--disabled', () => {
    expect(fieldStateClass('disabled')).toBe('sk-field--disabled');
  });

  it('readonly → sk-field--readonly', () => {
    expect(fieldStateClass('readonly')).toBe('sk-field--readonly');
  });

  it('default → sk-field--default', () => {
    expect(fieldStateClass('default')).toBe('sk-field--default');
  });

  it('function → sk-field--custom', () => {
    expect(fieldStateClass((v: unknown) => v)).toBe('sk-field--custom');
  });
});
