#!/usr/bin/env tsx
/**
 * CSS Variable Audit Script
 * Validates that all --sk-* CSS variable references are valid.
 * Exits with code 1 if invalid references are found.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

/** CSS variables that the theme system sets */
const REQUIRED_CSS_VARS: readonly string[] = [
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
  // Spacing (10)
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

interface Violation {
  file: string;
  line: number;
  varName: string;
  suggestion?: string;
}

/**
 * Recursively find all CSS files in a directory
 */
function findCssFiles(dir: string, results: string[] = []): string[] {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, etc.
      if (!['node_modules', 'dist', '.git', 'storybook-static', 'website'].includes(entry)) {
        findCssFiles(fullPath, results);
      }
    } else if (entry.endsWith('.css')) {
      results.push(fullPath);
    }
  }

  return results;
}

/** Set of REQUIRED_CSS_VARS for fast lookup */
const REQUIRED_SET = new Set(REQUIRED_CSS_VARS);

/**
 * Check if a CSS variable is valid.
 *
 * Valid patterns:
 * 1. Exact match in REQUIRED_CSS_VARS (theme vars set by ThemeProvider)
 * 2. ThemeProvider-generated: --sk-comp-*, --sk-z-*, --sk-custom-*
 * 3. Component-scoped override vars (3+ segments, e.g. --sk-card-padding)
 *    UNLESS stripping a wrong prefix reveals a known theme var (the real bug)
 */
function isValidCssVar(varName: string): boolean {
  // 1. Exact match in required theme vars
  if (REQUIRED_SET.has(varName)) {
    return true;
  }

  // 2. ThemeProvider JS-generated patterns
  if (
    varName.startsWith('--sk-comp-') ||
    varName.startsWith('--sk-z-') ||
    varName.startsWith('--sk-custom-')
  ) {
    return true;
  }

  // 3. Check for wrong-prefix bug: --sk-color-X where --sk-X exists
  //    This is the most common CSS var naming mistake
  if (varName.startsWith('--sk-color-')) {
    const stripped = varName.replace('--sk-color-', '--sk-');
    if (REQUIRED_SET.has(stripped)) {
      return false; // Definitely a bug
    }
  }

  // 4. Known wrong-family prefixes (theme injects --sk-space-*, not --sk-spacing-*)
  if (varName.startsWith('--sk-spacing-')) {
    return false;
  }

  // 5. Component-scoped vars: --sk-{component}-{property}
  //    Legitimate consumer-facing override points — but an UNDEFINED var
  //    without a fallback resolves to nothing (silent theming bug), so the
  //    caller additionally requires hasFallback or a definition for these.
  const parts = varName.replace('--sk-', '').split('-');
  if (parts.length >= 2) {
    return true;
  }

  return false;
}

/**
 * Find potential correct variable name by fuzzy matching
 */
function findSuggestion(invalidVar: string): string | undefined {
  // Strip common wrong prefixes
  const cleanedVar = invalidVar
    .replace('--sk-color-', '--sk-')
    .replace('--sk-bg-color-', '--sk-bg-')
    .replace('--sk-text-color-', '--sk-text-');

  // Check if any required var matches the cleaned version
  for (const validVar of REQUIRED_CSS_VARS) {
    if (validVar === cleanedVar) {
      return validVar;
    }
  }

  // Check if the suffix matches
  const suffix = invalidVar.split('-').slice(-2).join('-');
  for (const validVar of REQUIRED_CSS_VARS) {
    if (validVar.endsWith(suffix)) {
      return validVar;
    }
  }

  return undefined;
}

/**
 * Extract all var(--sk-*) references from CSS content
 */
interface VarOccurrence {
  line: number;
  hasFallback: boolean;
}

function extractCssVars(content: string): Map<string, VarOccurrence[]> {
  const varPattern = /var\((--sk-[a-z0-9-]+)\s*([,)])/g;
  const lines = content.split('\n');
  const vars = new Map<string, VarOccurrence[]>();

  lines.forEach((line, index) => {
    let match;
    while ((match = varPattern.exec(line)) !== null) {
      const varName = match[1];
      const hasFallback = match[2] === ',';

      if (!vars.has(varName)) {
        vars.set(varName, []);
      }
      vars.get(varName)!.push({ line: index + 1, hasFallback });
    }
  });

  return vars;
}

/**
 * Collect every --sk-* custom property DEFINED anywhere in src — CSS
 * declarations and TSX inline custom properties. A reference to a defined
 * var is valid even without a fallback.
 */
function collectDefinedVars(srcDir: string): Set<string> {
  const defined = new Set<string>();
  const defPatternCss = /(--sk-[a-z0-9-]+)\s*:/g;
  // Any quoted --sk-* string in TS/TSX counts as a potential definition
  // (object keys, bracket assignments like style['--sk-x'] = ...).
  const defPatternTsx = /['"](--sk-[a-z0-9-]+)['"]/g;
  const files = [...findCssFiles(srcDir), ...findTsxFiles(srcDir)];
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const pattern = file.endsWith('.css') ? defPatternCss : defPatternTsx;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      defined.add(match[1]);
    }
  }
  return defined;
}

function findTsxFiles(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) findTsxFiles(full, results);
    else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) results.push(full);
  }
  return results;
}

/**
 * Audit a single CSS file
 */
function auditCssFile(filePath: string, rootDir: string, defined: Set<string>): Violation[] {
  const content = readFileSync(filePath, 'utf-8');
  const vars = extractCssVars(content);
  const violations: Violation[] = [];
  const relativePath = relative(rootDir, filePath);

  for (const [varName, occurrences] of vars.entries()) {
    const knownTheme =
      REQUIRED_SET.has(varName) ||
      varName.startsWith('--sk-comp-') ||
      varName.startsWith('--sk-z-') ||
      varName.startsWith('--sk-custom-');

    if (!isValidCssVar(varName)) {
      const suggestion = findSuggestion(varName);
      for (const occ of occurrences) {
        violations.push({ file: relativePath, line: occ.line, varName, suggestion });
      }
      continue;
    }

    // Component-scoped var: must carry a fallback or be defined somewhere,
    // otherwise it silently resolves to nothing.
    if (!knownTheme && !defined.has(varName)) {
      for (const occ of occurrences) {
        if (!occ.hasFallback) {
          violations.push({
            file: relativePath,
            line: occ.line,
            varName,
            suggestion: `add a fallback: var(${varName}, var(--sk-<semantic-token>)) — undefined vars resolve to nothing`,
          });
        }
      }
    }
  }

  return violations;
}

/**
 * Main audit function
 */
function main() {
  const rootDir = join(import.meta.dirname || __dirname, '..');
  // Stylesheets live in the framework-agnostic hyperkit-styles package;
  // TSX var definitions (dynamic ThemeProvider families) live in src/.
  const srcDir = join(rootDir, 'src');
  const stylesDir = join(rootDir, 'packages', 'hyperkit-styles', 'src');

  console.log('Scanning CSS files for invalid --sk-* variable references...\n');

  const cssFiles = findCssFiles(stylesDir);
  const definedVars = new Set([...collectDefinedVars(srcDir), ...collectDefinedVars(stylesDir)]);

  const allViolations: Violation[] = [];

  for (const file of cssFiles) {
    const violations = auditCssFile(file, rootDir, definedVars);
    allViolations.push(...violations);
  }

  if (allViolations.length === 0) {
    console.log('✓ All CSS variable references are valid.\n');
    process.exit(0);
  }

  // Group by file for cleaner output
  const violationsByFile = new Map<string, Violation[]>();
  for (const violation of allViolations) {
    if (!violationsByFile.has(violation.file)) {
      violationsByFile.set(violation.file, []);
    }
    violationsByFile.get(violation.file)!.push(violation);
  }

  // Print violations
  for (const [file, violations] of violationsByFile.entries()) {
    for (const violation of violations) {
      console.log(`✗ ${file}:${violation.line}`);
      console.log(`  Invalid: ${violation.varName}`);
      if (violation.suggestion) {
        console.log(`  Did you mean: ${violation.suggestion} ?\n`);
      } else {
        console.log('');
      }
    }
  }

  const fileCount = violationsByFile.size;
  console.log(
    `Found ${allViolations.length} invalid CSS variable reference${allViolations.length === 1 ? '' : 's'} in ${fileCount} file${fileCount === 1 ? '' : 's'}.\n`
  );

  process.exit(1);
}

main();
