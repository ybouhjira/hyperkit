import { describe, it, expect, beforeEach } from 'vitest';
import { themePresets } from '../presets';
import { applyThemeToDOM } from '../ThemeProvider';
import { REQUIRED_CSS_VARS } from '../auditThemeVars';

describe('Theme CSS Variable Completeness', () => {
  beforeEach(() => {
    // Clear all inline styles from root before each test
    document.documentElement.removeAttribute('style');
  });

  Object.entries(themePresets).forEach(([id, theme]) => {
    it(`theme "${id}" sets all ${REQUIRED_CSS_VARS.length} required CSS variables`, () => {
      applyThemeToDOM(theme);
      const root = document.documentElement;

      const missing: string[] = [];
      REQUIRED_CSS_VARS.forEach((varName) => {
        const value = root.style.getPropertyValue(varName);
        if (!value) {
          missing.push(varName);
        }
      });

      if (missing.length > 0) {
        throw new Error(
          `Theme "${id}" is missing ${missing.length} CSS variables:\n${missing.map((v) => `  - ${v}`).join('\n')}`
        );
      }
    });
  });

  it('total theme count matches expectations', () => {
    expect(Object.keys(themePresets).length).toBe(40);
  });
});
