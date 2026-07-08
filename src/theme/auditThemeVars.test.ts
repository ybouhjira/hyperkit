import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// vi.mock is hoisted to top of file — use vi.hoisted to declare variables used inside it
const mockLogger = vi.hoisted(() => ({
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  group: vi.fn(),
  groupCollapsed: vi.fn(),
  groupEnd: vi.fn(),
}));

vi.mock('../utils/logger', () => ({ logger: mockLogger }));

import {
  auditThemeVars,
  logAuditResults,
  REQUIRED_CSS_VARS,
  CSS_VAR_GROUPS,
  type AuditVarResult,
  type AuditGroupResult,
  type ThemeAuditResult,
} from './auditThemeVars';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setDocumentVars(vars: Record<string, string>): void {
  Object.entries(vars).forEach(([name, value]) => {
    document.documentElement.style.setProperty(name, value);
  });
}

function clearDocumentVars(): void {
  document.documentElement.removeAttribute('style');
}

function makeElement(vars: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('div');
  Object.entries(vars).forEach(([name, value]) => {
    el.style.setProperty(name, value);
  });
  return el;
}

// ─── REQUIRED_CSS_VARS constant ───────────────────────────────────────────────

describe('REQUIRED_CSS_VARS', () => {
  it('is a non-empty readonly array', () => {
    expect(REQUIRED_CSS_VARS.length).toBeGreaterThan(0);
  });

  it('every entry starts with --sk-', () => {
    REQUIRED_CSS_VARS.forEach((v) => {
      expect(v).toMatch(/^--sk-/);
    });
  });

  it('contains core color tokens', () => {
    const required = [
      '--sk-bg-primary',
      '--sk-bg-secondary',
      '--sk-text-primary',
      '--sk-accent',
      '--sk-border',
      '--sk-success',
      '--sk-error',
    ];
    required.forEach((v) => {
      expect(REQUIRED_CSS_VARS).toContain(v);
    });
  });

  it('contains font tokens', () => {
    expect(REQUIRED_CSS_VARS).toContain('--sk-font-code');
    expect(REQUIRED_CSS_VARS).toContain('--sk-font-ui');
    expect(REQUIRED_CSS_VARS).toContain('--sk-font-mono');
  });

  it('contains radius tokens', () => {
    expect(REQUIRED_CSS_VARS).toContain('--sk-radius-sm');
    expect(REQUIRED_CSS_VARS).toContain('--sk-radius-xl');
  });

  it('contains spacing tokens', () => {
    expect(REQUIRED_CSS_VARS).toContain('--sk-space-md');
    expect(REQUIRED_CSS_VARS).toContain('--sk-space-lg');
  });

  it('contains motion tokens', () => {
    expect(REQUIRED_CSS_VARS).toContain('--sk-motion-fast');
    expect(REQUIRED_CSS_VARS).toContain('--sk-ease-standard');
  });

  it('contains focus ring tokens', () => {
    expect(REQUIRED_CSS_VARS).toContain('--sk-focus-width');
    expect(REQUIRED_CSS_VARS).toContain('--sk-focus-color');
  });

  it('contains scrollbar tokens', () => {
    expect(REQUIRED_CSS_VARS).toContain('--sk-scroll-width');
    expect(REQUIRED_CSS_VARS).toContain('--sk-scroll-thumb');
  });

  it('contains density tokens', () => {
    expect(REQUIRED_CSS_VARS).toContain('--sk-density-item-sm');
    expect(REQUIRED_CSS_VARS).toContain('--sk-density-gap-md');
  });

  it('has no duplicates', () => {
    const unique = new Set(REQUIRED_CSS_VARS);
    expect(unique.size).toBe(REQUIRED_CSS_VARS.length);
  });
});

// ─── CSS_VAR_GROUPS constant ──────────────────────────────────────────────────

describe('CSS_VAR_GROUPS', () => {
  it('contains known group names', () => {
    const groups = Object.keys(CSS_VAR_GROUPS);
    expect(groups).toContain('Colors');
    expect(groups).toContain('Fonts');
    expect(groups).toContain('Radius');
    expect(groups).toContain('Shadows');
    expect(groups).toContain('Font Sizes');
    expect(groups).toContain('Motion');
    expect(groups).toContain('Spacing');
  });

  it('every var in each group is in REQUIRED_CSS_VARS', () => {
    Object.entries(CSS_VAR_GROUPS).forEach(([groupName, vars]) => {
      vars.forEach((v) => {
        expect(REQUIRED_CSS_VARS).toContain(v);
        if (!REQUIRED_CSS_VARS.includes(v)) {
          throw new Error(`Group "${groupName}" contains "${v}" which is not in REQUIRED_CSS_VARS`);
        }
      });
    });
  });

  it('Colors group contains color-related vars only', () => {
    CSS_VAR_GROUPS['Colors']?.forEach((v) => {
      expect(v).toMatch(/^--sk-(bg|text|accent|border|success|warning|error|info)/);
    });
  });

  it('Radius group contains only --sk-radius- vars', () => {
    CSS_VAR_GROUPS['Radius']?.forEach((v) => {
      expect(v).toMatch(/^--sk-radius/);
    });
  });

  it('Shadows group contains only --sk-shadow- vars', () => {
    CSS_VAR_GROUPS['Shadows']?.forEach((v) => {
      expect(v).toMatch(/^--sk-shadow/);
    });
  });

  it('Spacing group contains only --sk-space- vars', () => {
    CSS_VAR_GROUPS['Spacing']?.forEach((v) => {
      expect(v).toMatch(/^--sk-space/);
    });
  });

  it('every group has at least one var', () => {
    Object.entries(CSS_VAR_GROUPS).forEach(([groupName, vars]) => {
      expect(vars.length).toBeGreaterThan(0);
      if (vars.length === 0) {
        throw new Error(`Group "${groupName}" is empty`);
      }
    });
  });

  it('all REQUIRED_CSS_VARS appear in at least one group', () => {
    const allGroupVars = new Set(Object.values(CSS_VAR_GROUPS).flat());
    REQUIRED_CSS_VARS.forEach((v) => {
      expect(allGroupVars.has(v)).toBe(true);
    });
  });
});

// ─── auditThemeVars function ──────────────────────────────────────────────────

describe('auditThemeVars', () => {
  afterEach(() => {
    clearDocumentVars();
  });

  describe('default root element (document.documentElement)', () => {
    it('returns a ThemeAuditResult with groups, totalVars, totalPassed, totalFailed, componentVars', () => {
      const result = auditThemeVars();
      expect(result).toHaveProperty('groups');
      expect(result).toHaveProperty('totalVars');
      expect(result).toHaveProperty('totalPassed');
      expect(result).toHaveProperty('totalFailed');
      expect(result).toHaveProperty('componentVars');
    });

    it('reports all vars as missing when no CSS vars are set', () => {
      clearDocumentVars();
      const result = auditThemeVars();
      expect(result.totalPassed).toBe(0);
      expect(result.totalFailed).toBe(REQUIRED_CSS_VARS.length);
      expect(result.totalVars).toBe(REQUIRED_CSS_VARS.length);
    });

    it('totalVars = totalPassed + totalFailed', () => {
      clearDocumentVars();
      const result = auditThemeVars();
      expect(result.totalVars).toBe(result.totalPassed + result.totalFailed);
    });

    it('reports set vars as ok', () => {
      clearDocumentVars();
      setDocumentVars({ '--sk-bg-primary': '#ffffff' });
      const result = auditThemeVars();
      expect(result.totalPassed).toBe(1);
      expect(result.totalFailed).toBe(REQUIRED_CSS_VARS.length - 1);
    });

    it('reports all vars as ok when all are set', () => {
      clearDocumentVars();
      const allVars: Record<string, string> = {};
      REQUIRED_CSS_VARS.forEach((v) => {
        allVars[v] = 'value';
      });
      setDocumentVars(allVars);
      const result = auditThemeVars();
      expect(result.totalPassed).toBe(REQUIRED_CSS_VARS.length);
      expect(result.totalFailed).toBe(0);
    });

    it('group passed count matches number of ok vars in group', () => {
      clearDocumentVars();
      // Set all Colors group vars
      const colorVars = CSS_VAR_GROUPS['Colors'] ?? [];
      const varsToSet: Record<string, string> = {};
      colorVars.forEach((v) => (varsToSet[v] = '#aaa'));
      setDocumentVars(varsToSet);

      const result = auditThemeVars();
      const colorsGroup = result.groups.find((g) => g.group === 'Colors');
      expect(colorsGroup).toBeDefined();
      expect(colorsGroup!.passed).toBe(colorVars.length);
      expect(colorsGroup!.failed).toBe(0);
    });

    it('group failed count matches number of missing vars in group', () => {
      clearDocumentVars();
      const result = auditThemeVars();
      result.groups.forEach((group) => {
        const expectedFailed = group.vars.filter((v) => v.status !== 'ok').length;
        expect(group.failed).toBe(expectedFailed);
      });
    });

    it('var status is ok when value is present', () => {
      clearDocumentVars();
      setDocumentVars({ '--sk-accent': '#0070f3' });
      const result = auditThemeVars();
      const colorsGroup = result.groups.find((g) => g.group === 'Colors');
      const accentVar = colorsGroup?.vars.find((v) => v.name === '--sk-accent');
      expect(accentVar?.status).toBe('ok');
      expect(accentVar?.value).toBe('#0070f3');
    });

    it('var status is missing when value is empty string', () => {
      clearDocumentVars();
      const result = auditThemeVars();
      const colorsGroup = result.groups.find((g) => g.group === 'Colors');
      const primaryVar = colorsGroup?.vars.find((v) => v.name === '--sk-bg-primary');
      expect(primaryVar?.status).toBe('missing');
      expect(primaryVar?.value).toBe('');
    });

    it('groups match CSS_VAR_GROUPS keys', () => {
      const result = auditThemeVars();
      const groupNames = result.groups.map((g) => g.group);
      Object.keys(CSS_VAR_GROUPS).forEach((key) => {
        expect(groupNames).toContain(key);
      });
    });

    it('groups contain correct number of vars', () => {
      const result = auditThemeVars();
      result.groups.forEach((group) => {
        const expectedCount = CSS_VAR_GROUPS[group.group]?.length ?? 0;
        expect(group.vars.length).toBe(expectedCount);
      });
    });
  });

  describe('custom root element', () => {
    it('accepts a custom root element', () => {
      const el = makeElement({ '--sk-bg-primary': '#333' });
      const result = auditThemeVars(el);
      const colorsGroup = result.groups.find((g) => g.group === 'Colors');
      const primaryVar = colorsGroup?.vars.find((v) => v.name === '--sk-bg-primary');
      expect(primaryVar?.status).toBe('ok');
      expect(primaryVar?.value).toBe('#333');
    });

    it('does not use document.documentElement when custom root is provided', () => {
      // Set vars on document root
      setDocumentVars({ '--sk-bg-primary': '#ffffff' });

      // Custom element with no vars
      const el = makeElement({});
      const result = auditThemeVars(el);

      const colorsGroup = result.groups.find((g) => g.group === 'Colors');
      const primaryVar = colorsGroup?.vars.find((v) => v.name === '--sk-bg-primary');
      // Custom element has no var set, so it should be missing
      expect(primaryVar?.status).toBe('missing');
    });

    it('counts component vars on custom element', () => {
      const el = makeElement({
        '--sk-comp-button-bg': 'blue',
        '--sk-comp-card-radius': '8px',
      });
      const result = auditThemeVars(el);
      expect(result.componentVars.length).toBe(2);
    });
  });

  describe('componentVars detection', () => {
    it('returns empty componentVars when no --sk-comp-* vars are set', () => {
      clearDocumentVars();
      const result = auditThemeVars();
      expect(result.componentVars).toEqual([]);
    });

    it('detects --sk-comp-* vars set on the element', () => {
      const el = makeElement({
        '--sk-comp-toolbar-bg': '#1a1a1a',
      });
      const result = auditThemeVars(el);
      expect(result.componentVars.length).toBe(1);
      expect(result.componentVars[0]!.name).toBe('--sk-comp-toolbar-bg');
      expect(result.componentVars[0]!.value).toBe('#1a1a1a');
      expect(result.componentVars[0]!.status).toBe('ok');
    });

    it('detects multiple --sk-comp-* vars', () => {
      const el = makeElement({
        '--sk-comp-button-height': '32px',
        '--sk-comp-input-border': '1px solid red',
        '--sk-comp-modal-shadow': '0 4px 8px black',
      });
      const result = auditThemeVars(el);
      expect(result.componentVars.length).toBe(3);
    });

    it('does not include non-comp vars in componentVars', () => {
      const el = makeElement({
        '--sk-bg-primary': '#fff',
        '--sk-comp-button-bg': 'blue',
      });
      const result = auditThemeVars(el);
      // Only the --sk-comp-* var should be in componentVars
      expect(result.componentVars.length).toBe(1);
      expect(result.componentVars[0]!.name).toBe('--sk-comp-button-bg');
    });

    it('component var always has status ok', () => {
      const el = makeElement({ '--sk-comp-custom': 'test' });
      const result = auditThemeVars(el);
      expect(result.componentVars[0]!.status).toBe('ok');
    });
  });

  describe('edge cases', () => {
    it('handles empty element with no inline styles', () => {
      const el = document.createElement('div');
      const result = auditThemeVars(el);
      expect(result.totalPassed).toBe(0);
      expect(result.totalFailed).toBe(REQUIRED_CSS_VARS.length);
      expect(result.componentVars).toEqual([]);
    });

    it('totalVars always equals number of REQUIRED_CSS_VARS', () => {
      clearDocumentVars();
      const result = auditThemeVars();
      expect(result.totalVars).toBe(REQUIRED_CSS_VARS.length);
    });

    it('partial set — mixed ok and missing', () => {
      clearDocumentVars();
      setDocumentVars({
        '--sk-bg-primary': '#000',
        '--sk-text-primary': '#fff',
        '--sk-accent': '#0070f3',
      });
      const result = auditThemeVars();
      expect(result.totalPassed).toBe(3);
      expect(result.totalFailed).toBe(REQUIRED_CSS_VARS.length - 3);
    });
  });
});

// ─── logAuditResults function ─────────────────────────────────────────────────

describe('logAuditResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when all vars pass', () => {
    const allPassResult: ThemeAuditResult = {
      groups: [
        {
          group: 'Colors',
          vars: [{ name: '--sk-bg-primary', value: '#111', status: 'ok' }],
          passed: 1,
          failed: 0,
        },
      ],
      totalVars: 1,
      totalPassed: 1,
      totalFailed: 0,
      componentVars: [],
    };

    it('calls logger.log with success message', () => {
      logAuditResults(allPassResult);
      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      const logArg = mockLogger.log.mock.calls[0]![0] as string;
      expect(logArg).toContain('[SolidKit Theme Audit]');
      expect(logArg).toContain('All 1 CSS variables set');
    });

    it('does not call logger.group when all pass', () => {
      logAuditResults(allPassResult);
      expect(mockLogger.group).not.toHaveBeenCalled();
    });

    it('does not call logger.warn when all pass', () => {
      logAuditResults(allPassResult);
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('includes component override count in log message when componentVars present', () => {
      const withCompVars: ThemeAuditResult = {
        ...allPassResult,
        componentVars: [
          { name: '--sk-comp-button-bg', value: 'red', status: 'ok' },
          { name: '--sk-comp-card-radius', value: '8px', status: 'ok' },
        ],
      };
      logAuditResults(withCompVars);
      const logArg = mockLogger.log.mock.calls[0]![0] as string;
      expect(logArg).toContain('+2 component overrides');
    });

    it('does not mention component overrides when componentVars is empty', () => {
      logAuditResults(allPassResult);
      const logArg = mockLogger.log.mock.calls[0]![0] as string;
      expect(logArg).not.toContain('component overrides');
    });
  });

  describe('when there are failures', () => {
    const failResult: ThemeAuditResult = {
      groups: [
        {
          group: 'Colors',
          vars: [
            { name: '--sk-bg-primary', value: '#111', status: 'ok' },
            { name: '--sk-text-primary', value: '', status: 'missing' },
            { name: '--sk-accent', value: '', status: 'missing' },
          ],
          passed: 1,
          failed: 2,
        },
        {
          group: 'Fonts',
          vars: [{ name: '--sk-font-ui', value: 'Inter', status: 'ok' }],
          passed: 1,
          failed: 0,
        },
      ],
      totalVars: 4,
      totalPassed: 2,
      totalFailed: 2,
      componentVars: [],
    };

    it('calls logger.group with failure count', () => {
      logAuditResults(failResult);
      expect(mockLogger.group).toHaveBeenCalledTimes(1);
      const groupArg = mockLogger.group.mock.calls[0]![0] as string;
      expect(groupArg).toContain('[SolidKit Theme Audit]');
      expect(groupArg).toContain('2 missing CSS variables');
    });

    it('calls logger.groupCollapsed for each failed group', () => {
      logAuditResults(failResult);
      // Only Colors group has failures
      expect(mockLogger.groupCollapsed).toHaveBeenCalledTimes(1);
      const collapsedArg = mockLogger.groupCollapsed.mock.calls[0]![0] as string;
      expect(collapsedArg).toContain('Colors');
      expect(collapsedArg).toContain('2/3 missing');
    });

    it('does not call groupCollapsed for groups with no failures', () => {
      logAuditResults(failResult);
      // Fonts group passed — no groupCollapsed call for it
      const collapsedCalls = mockLogger.groupCollapsed.mock.calls;
      const fontsCall = collapsedCalls.find((c) => (c[0] as string).includes('Fonts'));
      expect(fontsCall).toBeUndefined();
    });

    it('calls logger.warn for each missing var', () => {
      logAuditResults(failResult);
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
      const warnCalls = mockLogger.warn.mock.calls.map((c) => c[0] as string);
      expect(warnCalls.some((m) => m.includes('--sk-text-primary'))).toBe(true);
      expect(warnCalls.some((m) => m.includes('--sk-accent'))).toBe(true);
    });

    it('calls logger.groupEnd to close groups', () => {
      logAuditResults(failResult);
      // groupEnd called for inner (Colors) + outer group = 2
      expect(mockLogger.groupEnd).toHaveBeenCalledTimes(2);
    });

    it('does not call logger.log when there are failures', () => {
      logAuditResults(failResult);
      expect(mockLogger.log).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles result with zero total vars (all pass, 0 failed)', () => {
      const emptyResult: ThemeAuditResult = {
        groups: [],
        totalVars: 0,
        totalPassed: 0,
        totalFailed: 0,
        componentVars: [],
      };
      // Should not throw — 0 failed = success path
      expect(() => logAuditResults(emptyResult)).not.toThrow();
      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      const logArg = mockLogger.log.mock.calls[0]![0] as string;
      expect(logArg).toContain('All 0 CSS variables set');
    });

    it('handles multiple failed groups', () => {
      const multiFailResult: ThemeAuditResult = {
        groups: [
          {
            group: 'Colors',
            vars: [{ name: '--sk-bg-primary', value: '', status: 'missing' }],
            passed: 0,
            failed: 1,
          },
          {
            group: 'Fonts',
            vars: [{ name: '--sk-font-ui', value: '', status: 'missing' }],
            passed: 0,
            failed: 1,
          },
          {
            group: 'Radius',
            vars: [{ name: '--sk-radius-sm', value: '', status: 'missing' }],
            passed: 0,
            failed: 1,
          },
        ],
        totalVars: 3,
        totalPassed: 0,
        totalFailed: 3,
        componentVars: [],
      };
      logAuditResults(multiFailResult);
      // groupCollapsed called 3 times (one per failed group)
      expect(mockLogger.groupCollapsed).toHaveBeenCalledTimes(3);
      // warn called 3 times
      expect(mockLogger.warn).toHaveBeenCalledTimes(3);
    });

    it('warn message contains "Missing:" prefix for each var', () => {
      const singleFail: ThemeAuditResult = {
        groups: [
          {
            group: 'Colors',
            vars: [{ name: '--sk-bg-primary', value: '', status: 'missing' }],
            passed: 0,
            failed: 1,
          },
        ],
        totalVars: 1,
        totalPassed: 0,
        totalFailed: 1,
        componentVars: [],
      };
      logAuditResults(singleFail);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      const warnArg = mockLogger.warn.mock.calls[0]![0] as string;
      expect(warnArg).toContain('Missing:');
      expect(warnArg).toContain('--sk-bg-primary');
    });

    it('group with mixed ok and missing vars only warns about missing', () => {
      const mixedResult: ThemeAuditResult = {
        groups: [
          {
            group: 'Colors',
            vars: [
              { name: '--sk-bg-primary', value: '#fff', status: 'ok' },
              { name: '--sk-bg-secondary', value: '#eee', status: 'ok' },
              { name: '--sk-text-primary', value: '', status: 'missing' },
            ],
            passed: 2,
            failed: 1,
          },
        ],
        totalVars: 3,
        totalPassed: 2,
        totalFailed: 1,
        componentVars: [],
      };
      logAuditResults(mixedResult);
      // Only 1 warn for the missing var
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      const warnArg = mockLogger.warn.mock.calls[0]![0] as string;
      expect(warnArg).toContain('--sk-text-primary');
    });
  });
});

// ─── Type shape tests ─────────────────────────────────────────────────────────

describe('AuditVarResult type shape', () => {
  it('status can be ok, missing, or empty', () => {
    const okVar: AuditVarResult = { name: '--sk-bg-primary', value: '#fff', status: 'ok' };
    const missingVar: AuditVarResult = { name: '--sk-bg-primary', value: '', status: 'missing' };
    const emptyVar: AuditVarResult = { name: '--sk-bg-primary', value: '', status: 'empty' };

    expect(okVar.status).toBe('ok');
    expect(missingVar.status).toBe('missing');
    expect(emptyVar.status).toBe('empty');
  });
});

describe('AuditGroupResult type shape', () => {
  it('has group, vars, passed, failed', () => {
    const group: AuditGroupResult = {
      group: 'Colors',
      vars: [{ name: '--sk-bg-primary', value: '#fff', status: 'ok' }],
      passed: 1,
      failed: 0,
    };
    expect(group.group).toBe('Colors');
    expect(group.passed).toBe(1);
    expect(group.failed).toBe(0);
    expect(group.vars).toHaveLength(1);
  });
});
