/**
 * Theme CSS variable audit utilities.
 * Shared between runtime ThemeAuditor and test suite.
 */

import { logger } from '../utils/logger';

/** CSS variables that applyThemeToDOM MUST set for every theme */
export const REQUIRED_CSS_VARS: readonly string[] = [
  // Colors (17)
  '--sk-bg-primary',
  '--sk-bg-secondary',
  '--sk-bg-tertiary',
  '--sk-bg-elevated',
  '--sk-text-primary',
  '--sk-text-secondary',
  '--sk-text-muted',
  '--sk-accent',
  '--sk-accent-hover',
  '--sk-accent-muted',
  '--sk-border',
  '--sk-border-subtle',
  '--sk-success',
  '--sk-warning',
  '--sk-error',
  '--sk-info',
  '--sk-text-on-accent',
  // Fonts (3)
  '--sk-font-code',
  '--sk-font-ui',
  '--sk-font-mono',
  // Radius (4)
  '--sk-radius-sm',
  '--sk-radius-md',
  '--sk-radius-lg',
  '--sk-radius-xl',
  // Shadows (6)
  '--sk-shadow-sm',
  '--sk-shadow-md',
  '--sk-shadow-lg',
  '--sk-shadow-xl',
  '--sk-shadow-2xl',
  '--sk-shadow-inner',
  // Font sizes (6)
  '--sk-font-size-xs',
  '--sk-font-size-sm',
  '--sk-font-size-base',
  '--sk-font-size-lg',
  '--sk-font-size-xl',
  '--sk-font-size-2xl',
  // Surfaces (4)
  '--sk-surface-base-bg',
  '--sk-surface-raised-bg',
  '--sk-surface-overlay-bg',
  '--sk-surface-sunken-bg',
  // States (2 minimum)
  '--sk-state-hover-bg',
  '--sk-state-selected-bg',
  // Motion durations (5)
  '--sk-motion-instant',
  '--sk-motion-fast',
  '--sk-motion-normal',
  '--sk-motion-slow',
  '--sk-motion-emphasis',
  // Motion easings (4)
  '--sk-ease-standard',
  '--sk-ease-decelerate',
  '--sk-ease-accelerate',
  '--sk-ease-spring',
  // Focus ring (4)
  '--sk-focus-width',
  '--sk-focus-offset',
  '--sk-focus-color',
  '--sk-focus-style',
  // Scrollbar (5)
  '--sk-scroll-width',
  '--sk-scroll-thumb',
  '--sk-scroll-thumb-hover',
  '--sk-scroll-track',
  '--sk-scroll-thumb-radius',
  // Typography weights (4)
  '--sk-font-weight-regular',
  '--sk-font-weight-medium',
  '--sk-font-weight-semibold',
  '--sk-font-weight-bold',
  // Typography letter spacing (3)
  '--sk-letter-spacing-tight',
  '--sk-letter-spacing-normal',
  '--sk-letter-spacing-wide',
  // Typography line heights (3)
  '--sk-line-height-tight',
  '--sk-line-height-normal',
  '--sk-line-height-relaxed',
  // Density (8)
  '--sk-density-item-sm',
  '--sk-density-item-md',
  '--sk-density-item-lg',
  '--sk-density-pad-x',
  '--sk-density-pad-y',
  '--sk-density-gap-sm',
  '--sk-density-gap-md',
  '--sk-density-gap-lg',
  // Spacing (11)
  '--sk-space-0',
  '--sk-space-px',
  '--sk-space-2xs',
  '--sk-space-xs',
  '--sk-space-sm',
  '--sk-space-md',
  '--sk-space-lg',
  '--sk-space-xl',
  '--sk-space-2xl',
  '--sk-space-3xl',
  '--sk-space-4xl',
] as const;

/** Groups for organized reporting */
export const CSS_VAR_GROUPS: Record<string, readonly string[]> = {
  Colors: REQUIRED_CSS_VARS.filter((v) =>
    v.match(/^--sk-(bg|text|accent|border|success|warning|error|info)/)
  ),
  Fonts: REQUIRED_CSS_VARS.filter(
    (v) => v.startsWith('--sk-font-') && !v.includes('size') && !v.includes('weight')
  ),
  Radius: REQUIRED_CSS_VARS.filter((v) => v.startsWith('--sk-radius')),
  Shadows: REQUIRED_CSS_VARS.filter((v) => v.startsWith('--sk-shadow')),
  'Font Sizes': REQUIRED_CSS_VARS.filter((v) => v.startsWith('--sk-font-size')),
  Surfaces: REQUIRED_CSS_VARS.filter((v) => v.startsWith('--sk-surface')),
  States: REQUIRED_CSS_VARS.filter((v) => v.startsWith('--sk-state')),
  Motion: REQUIRED_CSS_VARS.filter((v) => v.startsWith('--sk-motion') || v.startsWith('--sk-ease')),
  Focus: REQUIRED_CSS_VARS.filter((v) => v.startsWith('--sk-focus')),
  Scrollbar: REQUIRED_CSS_VARS.filter((v) => v.startsWith('--sk-scroll')),
  Typography: REQUIRED_CSS_VARS.filter((v) =>
    v.match(/^--sk-(font-weight|letter-spacing|line-height)/)
  ),
  Density: REQUIRED_CSS_VARS.filter((v) => v.startsWith('--sk-density')),
  Spacing: REQUIRED_CSS_VARS.filter((v) => v.startsWith('--sk-space')),
};

export interface AuditVarResult {
  name: string;
  value: string;
  status: 'ok' | 'missing' | 'empty';
}

export interface AuditGroupResult {
  group: string;
  vars: AuditVarResult[];
  passed: number;
  failed: number;
}

export interface ThemeAuditResult {
  groups: AuditGroupResult[];
  totalVars: number;
  totalPassed: number;
  totalFailed: number;
  componentVars: AuditVarResult[];
}

/**
 * Audit theme CSS variables on a root element.
 * Checks all required vars and any --sk-comp-* vars present.
 */
export function auditThemeVars(root?: HTMLElement): ThemeAuditResult {
  const el = root ?? document.documentElement;
  const style = el.style;

  const groups: AuditGroupResult[] = Object.entries(CSS_VAR_GROUPS).map(([group, vars]) => {
    const results: AuditVarResult[] = vars.map((name) => {
      const value = style.getPropertyValue(name);
      return {
        name,
        value,
        status: value ? 'ok' : 'missing',
      };
    });
    return {
      group,
      vars: results,
      passed: results.filter((r) => r.status === 'ok').length,
      failed: results.filter((r) => r.status !== 'ok').length,
    };
  });

  // Also scan for any --sk-comp-* vars that ARE set (informational)
  const componentVars: AuditVarResult[] = [];
  for (let i = 0; i < style.length; i++) {
    const prop = style[i];
    if (prop != null && prop.startsWith('--sk-comp-')) {
      const value = style.getPropertyValue(prop);
      componentVars.push({
        name: prop,
        value: value ?? '',
        status: 'ok',
      });
    }
  }

  const totalPassed = groups.reduce((sum, g) => sum + g.passed, 0);
  const totalFailed = groups.reduce((sum, g) => sum + g.failed, 0);

  return {
    groups,
    totalVars: totalPassed + totalFailed,
    totalPassed,
    totalFailed,
    componentVars,
  };
}

/** Log audit results to console with grouped output */
export function logAuditResults(result: ThemeAuditResult): void {
  const hasIssues = result.totalFailed > 0;

  if (hasIssues) {
    logger.group(
      `%c[SolidKit Theme Audit] ${result.totalFailed} missing CSS variables`,
      'color: #ff6b6b; font-weight: bold;'
    );
    result.groups.forEach((group) => {
      if (group.failed > 0) {
        logger.groupCollapsed(
          `%c✗ ${group.group} (${group.failed}/${group.vars.length} missing)`,
          'color: #ff6b6b;'
        );

        group.vars
          .filter((v) => v.status !== 'ok')
          .forEach((v) => logger.warn(`  Missing: ${v.name}`));
        logger.groupEnd();
      }
    });
    logger.groupEnd();
  } else {
    logger.log(
      `%c[SolidKit Theme Audit] ✓ All ${result.totalPassed} CSS variables set` +
        (result.componentVars.length > 0
          ? ` (+${result.componentVars.length} component overrides)`
          : ''),
      'color: #51cf66; font-weight: bold;'
    );
  }
}
