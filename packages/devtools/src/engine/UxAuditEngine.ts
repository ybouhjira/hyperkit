/**
 * UxAuditEngine — Pure programmatic CSS/DOM audit against the 10 design laws
 * from the premium-ui design spec (skills/premium-ui-design.md).
 *
 * No SolidJS dependency. Runs entirely in the browser via getComputedStyle + DOM APIs.
 */

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface UxAuditCheck {
  id: string;
  law: number;
  lawName: string;
  severity: 'pass' | 'warning' | 'violation';
  title: string;
  detail: string;
  expected: string;
  element?: HTMLElement;
  value?: string;
}

export interface LawScore {
  law: number;
  name: string;
  score: number; // 0-10
  checks: UxAuditCheck[];
  passCount: number;
  violationCount: number;
  warningCount: number;
}

export interface UxAuditResult {
  overallScore: number; // 0-100
  laws: LawScore[];
  totalChecks: number;
  totalViolations: number;
  totalWarnings: number;
  totalPasses: number;
  timestamp: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a CSS duration string (e.g., "0.15s", "150ms") to milliseconds. */
function parseDurationMs(value: string): number {
  const trimmed = value.trim();
  if (trimmed.endsWith('ms')) return parseFloat(trimmed);
  if (trimmed.endsWith('s')) return parseFloat(trimmed) * 1000;
  return 0;
}

/** Check if a color string is roughly monochromatic (r ≈ g ≈ b within 15 units). */
function isMonochromatic(color: string): boolean {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return true;
  if (color === 'inherit' || color === 'currentColor' || color === 'unset') return true;
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return true; // treat unknowns as monochrome
  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min <= 15;
}

/** Extract alpha from an rgba string. Returns 1 for rgb (fully opaque). */
function extractAlpha(color: string): number {
  const match = color.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
  if (match && match[1]) return parseFloat(match[1]);
  if (color.startsWith('rgb(')) return 1;
  return 0; // transparent / unknown
}

/** Get pixel size as a number from a computed style value like "14px". */
function parsePx(value: string): number {
  return parseFloat(value) || 0;
}

/** Check if an element is visible. */
function isVisible(el: Element): boolean {
  const style = getComputedStyle(el);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
}

/** Collect all visible elements under root, excluding the devtools panel itself. */
function getVisibleElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll('*')).filter((el): el is HTMLElement => {
    if (el.closest('.sk-devtools')) return false;
    return isVisible(el);
  });
}

/** Get all interactive elements (buttons, links, inputs, selects). */
function getInteractiveElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])')
  ).filter((el): el is HTMLElement => !el.closest('.sk-devtools') && isVisible(el));
}

/** Compute a set of unique values for a CSS property across elements. */
function uniqueComputedValues(
  elements: HTMLElement[],
  prop: string
): Set<string> {
  const values = new Set<string>();
  for (const el of elements) {
    const v = getComputedStyle(el).getPropertyValue(prop).trim();
    if (v && v !== 'none' && v !== 'normal' && v !== 'auto') {
      values.add(v);
    }
  }
  return values;
}

/** Count hue "buckets" (unique distinct non-monochrome hues). */
function countUniqueHues(colors: string[]): number {
  const hues = new Set<number>();
  for (const color of colors) {
    if (isMonochromatic(color)) continue;
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) continue;
    const r = Number(match[1]);
    const g = Number(match[2]);
    const b = Number(match[3]);
    // Compute hue bucket (12 buckets = 30° each)
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    if (max - min < 0.05) continue; // near-grey
    let hue = 0;
    if (max === rn) hue = ((gn - bn) / (max - min)) % 6;
    else if (max === gn) hue = (bn - rn) / (max - min) + 2;
    else hue = (rn - gn) / (max - min) + 4;
    hue = Math.round(((hue * 60) + 360) % 360 / 30);
    hues.add(hue);
  }
  return hues.size;
}

/** Check if any stylesheet uses a given selector/pattern string. */
function stylesheetContainsPattern(pattern: RegExp): boolean {
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = Array.from(sheet.cssRules ?? []);
        for (const rule of rules) {
          if (pattern.test(rule.cssText)) return true;
        }
      } catch { /* Cross-origin stylesheet */ }
    }
  } catch { /* StyleSheet API unavailable */ }
  return false;
}

// ─── Law Checks ───────────────────────────────────────────────────────────────

function checkLaw1Speed(root: HTMLElement, elements: HTMLElement[]): UxAuditCheck[] {
  const checks: UxAuditCheck[] = [];
  const lawName = 'Speed';

  // 1. transition-duration-check: any element with transition > 300ms
  let slowTransitionEl: HTMLElement | undefined;
  for (const el of elements) {
    const durations = getComputedStyle(el).transitionDuration.split(',');
    for (const d of durations) {
      if (parseDurationMs(d) > 300) {
        slowTransitionEl = el;
        break;
      }
    }
    if (slowTransitionEl) break;
  }
  checks.push(
    slowTransitionEl
      ? {
          id: 'transition-duration-check',
          law: 1,
          lawName,
          severity: 'violation',
          title: 'Transition duration > 300ms found',
          detail: `Element has transition-duration: ${getComputedStyle(slowTransitionEl).transitionDuration}`,
          expected: 'All transitions ≤ 300ms (target: 150ms)',
          element: slowTransitionEl,
          value: getComputedStyle(slowTransitionEl).transitionDuration,
        }
      : {
          id: 'transition-duration-check',
          law: 1,
          lawName,
          severity: 'pass',
          title: 'No slow transitions found',
          detail: 'All checked transitions are ≤ 300ms',
          expected: 'All transitions ≤ 300ms',
        }
  );

  // 2. spinner-usage: elements with "spinner" / "loading" class using animation
  const spinnerEls = Array.from(root.querySelectorAll('[class*="spinner"], [class*="loading"]')).filter(
    (el): el is HTMLElement =>
      !el.closest('.sk-devtools') &&
      isVisible(el) &&
      getComputedStyle(el).animationName !== 'none'
  );
  checks.push(
    spinnerEls.length > 0
      ? {
          id: 'spinner-usage',
          law: 1,
          lawName,
          severity: 'warning',
          title: `${spinnerEls.length} spinner animation(s) found`,
          detail: `Spinners found: ${spinnerEls.map((e) => e.className).slice(0, 2).join(', ')}`,
          expected: 'Use skeleton shimmer instead of spinners for loading states',
          element: spinnerEls[0],
          value: String(spinnerEls.length),
        }
      : {
          id: 'spinner-usage',
          law: 1,
          lawName,
          severity: 'pass',
          title: 'No spinner animations found',
          detail: 'No elements with spinner/loading class and spin animation detected',
          expected: 'Prefer skeleton shimmer over spinners',
        }
  );

  // 3. confirm-dialog-check: alertdialog elements
  const alertDialogs = Array.from(root.querySelectorAll('[role="alertdialog"]')).filter(
    (el): el is HTMLElement => !el.closest('.sk-devtools') && isVisible(el)
  );
  checks.push(
    alertDialogs.length > 0
      ? {
          id: 'confirm-dialog-check',
          law: 1,
          lawName,
          severity: 'warning',
          title: `${alertDialogs.length} confirmation dialog(s) visible`,
          detail: 'Alert dialogs found — consider replacing with undo toast patterns',
          expected: 'Replace "Are you sure?" dialogs with undo toast (5s window)',
          element: alertDialogs[0],
          value: String(alertDialogs.length),
        }
      : {
          id: 'confirm-dialog-check',
          law: 1,
          lawName,
          severity: 'pass',
          title: 'No confirmation dialogs found',
          detail: 'No alertdialog role elements detected in the current view',
          expected: 'Use undo toast patterns instead of confirm dialogs',
        }
  );

  // 4. skeleton-usage: elements with skeleton class (good practice)
  const skeletonEls = Array.from(root.querySelectorAll('[class*="skeleton"]')).filter(
    (el): el is HTMLElement => !el.closest('.sk-devtools')
  );
  checks.push({
    id: 'skeleton-usage',
    law: 1,
    lawName,
    severity: skeletonEls.length > 0 ? 'pass' : 'warning',
    title:
      skeletonEls.length > 0
        ? `${skeletonEls.length} skeleton placeholder(s) found`
        : 'No skeleton placeholders found',
    detail:
      skeletonEls.length > 0
        ? 'Skeleton loading patterns are in use'
        : 'No skeleton elements detected — loading states may use spinners',
    expected: 'Use skeleton shimmer for all async content loading',
    value: String(skeletonEls.length),
  });

  // 5. transition-present: interactive elements should have transitions
  const interactive = getInteractiveElements(root);
  const withTransition = interactive.filter(
    (el) => getComputedStyle(el).transitionProperty !== 'none'
  );
  const ratio = interactive.length > 0 ? withTransition.length / interactive.length : 1;
  checks.push({
    id: 'transition-present',
    law: 1,
    lawName,
    severity: ratio >= 0.7 ? 'pass' : ratio >= 0.4 ? 'warning' : 'violation',
    title:
      ratio >= 0.7
        ? 'Interactive elements have transitions'
        : 'Many interactive elements lack transitions',
    detail: `${withTransition.length}/${interactive.length} interactive elements have CSS transitions`,
    expected: '≥ 70% of interactive elements should have transition properties',
    value: `${Math.round(ratio * 100)}%`,
  });

  return checks;
}

function checkLaw2Depth(root: HTMLElement, elements: HTMLElement[]): UxAuditCheck[] {
  const checks: UxAuditCheck[] = [];
  const lawName = 'Depth';

  // 1. surface-tier-count: count unique background-colors (3-5 tiers is ideal)
  const bgColors = new Set(
    elements
      .map((el) => getComputedStyle(el).backgroundColor)
      .filter((c) => c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent')
  );
  const tierCount = bgColors.size;
  checks.push({
    id: 'surface-tier-count',
    law: 2,
    lawName,
    severity: tierCount >= 2 && tierCount <= 6 ? 'pass' : tierCount === 1 ? 'warning' : 'warning',
    title: `${tierCount} unique background surface(s) found`,
    detail: `${tierCount} distinct background-color values detected across visible elements`,
    expected: '3–5 surface tiers (base, raised, overlay, sunken)',
    value: String(tierCount),
  });

  // 2. border-opacity: sample border colors — should have low alpha (≤ 0.15) for subtle borders
  const borderedEls = elements.filter((el) => {
    const s = getComputedStyle(el);
    return s.borderTopWidth !== '0px' && s.borderTopStyle !== 'none';
  });
  const highOpacityBorders = borderedEls.filter((el) => {
    const color = getComputedStyle(el).borderTopColor;
    const alpha = extractAlpha(color);
    return alpha > 0.5 && !isMonochromatic(color);
  });
  checks.push(
    highOpacityBorders.length > 2
      ? {
          id: 'border-opacity',
          law: 2,
          lawName,
          severity: 'warning',
          title: `${highOpacityBorders.length} elements with opaque colored borders`,
          detail: 'Borders should be subtle (low opacity or monochromatic)',
          expected: 'Borders: rgba with alpha ≤ 0.15 for subtle depth',
          element: highOpacityBorders[0],
          value: String(highOpacityBorders.length),
        }
      : {
          id: 'border-opacity',
          law: 2,
          lawName,
          severity: 'pass',
          title: 'Border opacity is appropriate',
          detail: 'Sampled borders appear subtle and monochromatic',
          expected: 'Borders: rgba with alpha ≤ 0.15',
        }
  );

  // 3. shadow-on-inline: non-fixed/absolute elements with box-shadow (potential noise)
  const inlineShadowEls = elements.filter((el) => {
    const s = getComputedStyle(el);
    if (s.boxShadow === 'none') return false;
    const pos = s.position;
    if (pos === 'fixed' || pos === 'absolute' || pos === 'sticky') return false;
    const role = el.getAttribute('role');
    if (role === 'dialog' || role === 'tooltip' || role === 'menu') return false;
    return true;
  });
  checks.push(
    inlineShadowEls.length > 3
      ? {
          id: 'shadow-on-inline',
          law: 2,
          lawName,
          severity: 'warning',
          title: `${inlineShadowEls.length} inline elements with box-shadow`,
          detail: 'Shadows on inline elements can add visual noise',
          expected: 'Shadows should only float: modals, dropdowns, command palette',
          element: inlineShadowEls[0],
          value: String(inlineShadowEls.length),
        }
      : {
          id: 'shadow-on-inline',
          law: 2,
          lawName,
          severity: 'pass',
          title: 'Shadow usage is restrained',
          detail: 'Shadows appear primarily on floating/overlay elements',
          expected: 'Shadows only for floating elements',
        }
  );

  // 4. backdrop-filter-restraint: ≤ 3 elements
  const backdropEls = elements.filter(
    (el) => getComputedStyle(el).backdropFilter !== 'none'
  );
  checks.push({
    id: 'backdrop-filter-restraint',
    law: 2,
    lawName,
    severity: backdropEls.length <= 3 ? 'pass' : 'warning',
    title: `${backdropEls.length} element(s) using backdrop-filter`,
    detail:
      backdropEls.length <= 3
        ? 'Backdrop-filter is used sparingly'
        : 'Excessive use of backdrop-filter may impact performance',
    expected: '≤ 3 elements using backdrop-filter (command palette, floating panels)',
    value: String(backdropEls.length),
  });

  return checks;
}

function checkLaw3Typography(root: HTMLElement, elements: HTMLElement[]): UxAuditCheck[] {
  const checks: UxAuditCheck[] = [];
  const lawName = 'Typography';

  const textEls = elements.filter((el) => {
    const children = Array.from(el.childNodes);
    return children.some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
  });

  // 1. font-size-count: unique font-sizes (≤ 5, ideally 3)
  const fontSizes = uniqueComputedValues(textEls, 'font-size');
  const sizeCount = fontSizes.size;
  checks.push({
    id: 'font-size-count',
    law: 3,
    lawName,
    severity: sizeCount <= 4 ? 'pass' : sizeCount <= 6 ? 'warning' : 'violation',
    title: `${sizeCount} unique font size(s) found`,
    detail: `Font sizes in use: ${Array.from(fontSizes).join(', ')}`,
    expected: '≤ 5 font sizes (ideally 3: heading, body, meta)',
    value: String(sizeCount),
  });

  // 2. letter-spacing-headings: headings should have negative letter-spacing
  const headings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(
    (el): el is HTMLElement => !el.closest('.sk-devtools') && isVisible(el)
  );
  const heavyEls = elements.filter(
    (el) => parsePx(getComputedStyle(el).fontWeight) >= 600
  );
  const allHeadings = [...new Set([...headings, ...heavyEls])];
  const badSpacing = allHeadings.filter((el) => {
    const ls = getComputedStyle(el).letterSpacing;
    if (ls === 'normal') return true; // missing negative letter-spacing
    return parsePx(ls) >= 0; // positive or zero = bad
  });
  checks.push(
    badSpacing.length > 0 && allHeadings.length > 0
      ? {
          id: 'letter-spacing-headings',
          law: 3,
          lawName,
          severity: 'warning',
          title: `${badSpacing.length} heading(s) without negative letter-spacing`,
          detail: 'Headings should have letter-spacing: -0.02em for premium feel',
          expected: 'Headings: letter-spacing ≤ -0.01em',
          element: badSpacing[0]!,
          value: getComputedStyle(badSpacing[0]!).letterSpacing,
        }
      : {
          id: 'letter-spacing-headings',
          law: 3,
          lawName,
          severity: allHeadings.length === 0 ? 'pass' : 'pass',
          title: 'Heading letter-spacing looks good',
          detail:
            allHeadings.length === 0
              ? 'No heading elements found — skip'
              : 'Headings use negative letter-spacing',
          expected: 'Headings: letter-spacing ≤ -0.01em',
        }
  );

  // 3. line-height-range: body text line-height 1.3–1.6
  const badLineHeight = textEls.filter((el) => {
    const lh = getComputedStyle(el).lineHeight;
    if (lh === 'normal') return false;
    const num = parseFloat(lh);
    if (isNaN(num)) return false;
    const fs = parsePx(getComputedStyle(el).fontSize);
    const ratio = fs > 0 ? num / fs : 0;
    return ratio > 0 && (ratio < 1.2 || ratio > 1.8);
  });
  checks.push(
    badLineHeight.length > 3
      ? {
          id: 'line-height-range',
          law: 3,
          lawName,
          severity: 'warning',
          title: `${badLineHeight.length} element(s) with unusual line-height`,
          detail: 'Line-height outside 1.3–1.6 range may reduce readability',
          expected: 'Line-height: 1.3–1.6 for body text, 1.375 for UI elements',
          element: badLineHeight[0]!,
          value: getComputedStyle(badLineHeight[0]!).lineHeight,
        }
      : {
          id: 'line-height-range',
          law: 3,
          lawName,
          severity: 'pass',
          title: 'Line-height is within acceptable range',
          detail: 'Text elements use appropriate line-height',
          expected: 'Line-height: 1.3–1.6',
        }
  );

  // 4. font-weight-no-bold: no 700+ weight in UI elements
  const boldEls = elements.filter((el) => {
    const fw = parsePx(getComputedStyle(el).fontWeight);
    return fw >= 700;
  });
  checks.push(
    boldEls.length > 0
      ? {
          id: 'font-weight-no-bold',
          law: 3,
          lawName,
          severity: 'warning',
          title: `${boldEls.length} element(s) with font-weight ≥ 700`,
          detail: 'Bold weight (700+) is too heavy for UI text; use semibold (600)',
          expected: 'Maximum font-weight: 600 (semibold) for UI elements',
          element: boldEls[0]!,
          value: getComputedStyle(boldEls[0]!).fontWeight,
        }
      : {
          id: 'font-weight-no-bold',
          law: 3,
          lawName,
          severity: 'pass',
          title: 'No font-weight ≥ 700 found',
          detail: 'All elements use semibold (600) or lighter',
          expected: 'Max font-weight: 600 (semibold)',
        }
  );

  // 5. body-font-size: most common font-size should be 13–15px
  const sizeMap = new Map<string, number>();
  for (const el of textEls) {
    const fs = getComputedStyle(el).fontSize;
    sizeMap.set(fs, (sizeMap.get(fs) ?? 0) + 1);
  }
  let mostCommonSize = '';
  let maxCount = 0;
  sizeMap.forEach((count, size) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonSize = size;
    }
  });
  const mostCommonPx = parsePx(mostCommonSize);
  checks.push({
    id: 'body-font-size',
    law: 3,
    lawName,
    severity:
      mostCommonPx >= 13 && mostCommonPx <= 15
        ? 'pass'
        : mostCommonPx === 16
        ? 'warning'
        : textEls.length === 0
        ? 'pass'
        : 'warning',
    title: mostCommonSize
      ? `Most common font-size: ${mostCommonSize}`
      : 'No text elements found',
    detail: mostCommonSize
      ? `${mostCommonPx < 13 ? 'Too small' : mostCommonPx > 15 ? 'Too large' : 'Good'} — body text at ${mostCommonSize}`
      : 'No visible text elements detected',
    expected: 'Body font-size: 13–15px (ideally 14px)',
    value: mostCommonSize,
  });

  // 6. font-family-count: ≤ 2 unique font-families
  const fontFamilies = new Set(
    elements
      .map((el) => (getComputedStyle(el).fontFamily.split(',')[0] ?? '').trim().replace(/['"]/g, ''))
      .filter(Boolean)
  );
  const familyCount = fontFamilies.size;
  checks.push({
    id: 'font-family-count',
    law: 3,
    lawName,
    severity: familyCount <= 2 ? 'pass' : familyCount <= 3 ? 'warning' : 'violation',
    title: `${familyCount} unique font family(ies) found`,
    detail: `Families: ${Array.from(fontFamilies).slice(0, 4).join(', ')}`,
    expected: '≤ 2 font families (one UI + one monospace)',
    value: String(familyCount),
  });

  return checks;
}

function checkLaw4Color(root: HTMLElement, elements: HTMLElement[]): UxAuditCheck[] {
  const checks: UxAuditCheck[] = [];
  const lawName = 'Color';

  // Compute accent color from CSS variable
  const rootStyle = getComputedStyle(document.documentElement);
  const accentColor = rootStyle.getPropertyValue('--sk-accent').trim();

  // Collect all foreground + background colors
  const allColors = elements.flatMap((el) => {
    const s = getComputedStyle(el);
    return [s.color, s.backgroundColor];
  });

  // 1. monochrome-ratio: colored elements < 15% of total
  const coloredCount = allColors.filter((c) => c && c !== 'rgba(0, 0, 0, 0)' && !isMonochromatic(c)).length;
  const ratio = allColors.length > 0 ? coloredCount / allColors.length : 0;
  checks.push({
    id: 'monochrome-ratio',
    law: 4,
    lawName,
    severity: ratio <= 0.15 ? 'pass' : ratio <= 0.3 ? 'warning' : 'violation',
    title: `${Math.round(ratio * 100)}% colored elements (target: < 15%)`,
    detail: `${coloredCount} colored color values out of ${allColors.length} sampled`,
    expected: '< 15% of elements should use non-monochromatic colors',
    value: `${Math.round(ratio * 100)}%`,
  });

  // 2. accent-spot-count: elements using accent color (≤ 5 per viewport)
  let accentCount = 0;
  let firstAccentEl: HTMLElement | undefined;
  if (accentColor) {
    for (const el of elements) {
      const s = getComputedStyle(el);
      if (s.color === accentColor || s.backgroundColor === accentColor || s.borderTopColor === accentColor) {
        accentCount++;
        if (!firstAccentEl) firstAccentEl = el;
      }
    }
  }
  checks.push({
    id: 'accent-spot-count',
    law: 4,
    lawName,
    severity: accentCount <= 5 ? 'pass' : accentCount <= 10 ? 'warning' : 'violation',
    title:
      accentColor
        ? `${accentCount} element(s) use the accent color`
        : 'Could not detect --sk-accent variable',
    detail:
      accentColor
        ? `Accent color (${accentColor}) appears on ${accentCount} elements`
        : 'Missing --sk-accent CSS variable — is ThemeProvider configured?',
    expected: '≤ 5 accent-colored elements per viewport (1-2 spots)',
    element: firstAccentEl,
    value: String(accentCount),
  });

  // 3. decorative-gradient: gradient backgrounds that aren't progress bars
  const gradientEls = elements.filter((el) => {
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg.includes('linear-gradient') && !bg.includes('radial-gradient')) return false;
    const role = el.getAttribute('role');
    const cls = el.className;
    if (role === 'progressbar') return false;
    if (typeof cls === 'string' && (cls.includes('progress') || cls.includes('gradient-bg') || cls.includes('resize-handle'))) return false;
    return true;
  });
  checks.push(
    gradientEls.length > 0
      ? {
          id: 'decorative-gradient',
          law: 4,
          lawName,
          severity: 'warning',
          title: `${gradientEls.length} decorative gradient(s) found`,
          detail: `Gradient backgrounds detected on non-progress elements`,
          expected: 'Gradients should only appear on progress bars, not decorative elements',
          element: gradientEls[0],
          value: String(gradientEls.length),
        }
      : {
          id: 'decorative-gradient',
          law: 4,
          lawName,
          severity: 'pass',
          title: 'No decorative gradients found',
          detail: 'Background gradients appear only on progress/structural elements',
          expected: 'Gradients on progress bars only',
        }
  );

  // 4. unique-hue-count: ≤ 3 distinct hues
  const sampledColors = elements
    .map((el) => getComputedStyle(el).color)
    .filter((c) => c && c !== 'rgba(0, 0, 0, 0)');
  const hueCount = countUniqueHues(sampledColors);
  checks.push({
    id: 'unique-hue-count',
    law: 4,
    lawName,
    severity: hueCount <= 3 ? 'pass' : hueCount <= 5 ? 'warning' : 'violation',
    title: `~${hueCount} distinct hue(s) in use`,
    detail: `Approximately ${hueCount} unique color hues detected across text elements`,
    expected: '≤ 3 hues: accent + success + error (monochrome for everything else)',
    value: String(hueCount),
  });

  // 5. status-color-usage: requires visual inspection
  checks.push({
    id: 'status-color-usage',
    law: 4,
    lawName,
    severity: 'pass',
    title: 'Status color scoping requires visual inspection',
    detail: 'Automated check cannot verify semantic intent — check that success/warning/error colors are used only for actual status indicators',
    expected: 'Status colors (success, warning, error) only on actual status elements',
  });

  return checks;
}

function checkLaw5Density(root: HTMLElement, elements: HTMLElement[]): UxAuditCheck[] {
  const checks: UxAuditCheck[] = [];
  const lawName = 'Density';

  // 1. body-text-size: most common font-size 13-15px (re-check in density context)
  const textEls = elements.filter((el) => {
    const children = Array.from(el.childNodes);
    return children.some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
  });
  const sizeMap = new Map<string, number>();
  for (const el of textEls) {
    const fs = getComputedStyle(el).fontSize;
    sizeMap.set(fs, (sizeMap.get(fs) ?? 0) + 1);
  }
  let mostCommonSize = '';
  let maxCount = 0;
  sizeMap.forEach((count, size) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonSize = size;
    }
  });
  const mostCommonPx = parsePx(mostCommonSize);
  checks.push({
    id: 'body-text-size',
    law: 5,
    lawName,
    severity:
      mostCommonPx >= 13 && mostCommonPx <= 15
        ? 'pass'
        : textEls.length === 0
        ? 'pass'
        : 'warning',
    title: mostCommonSize ? `Body text at ${mostCommonSize}` : 'No text elements',
    detail: `Most common font-size across text elements: ${mostCommonSize || 'N/A'}`,
    expected: '13–15px body text (density-optimized)',
    value: mostCommonSize,
  });

  // 2. list-item-height: li, [role="option"], sidebar items 28-36px
  const listItems = Array.from(
    root.querySelectorAll('li, [role="option"], [role="menuitem"], [role="treeitem"]')
  ).filter((el): el is HTMLElement => !el.closest('.sk-devtools') && isVisible(el));
  const tallListItems = listItems.filter((el) => {
    const h = el.getBoundingClientRect().height;
    return h > 0 && (h < 24 || h > 40);
  });
  checks.push(
    listItems.length === 0
      ? {
          id: 'list-item-height',
          law: 5,
          lawName,
          severity: 'pass',
          title: 'No list items found',
          detail: 'No list items or option elements detected',
          expected: 'List items: 28–36px height',
        }
      : tallListItems.length > 2
      ? {
          id: 'list-item-height',
          law: 5,
          lawName,
          severity: 'warning',
          title: `${tallListItems.length} list item(s) with non-standard height`,
          detail: `${tallListItems.length}/${listItems.length} list items outside 24–40px range`,
          expected: 'List items: 28–36px height for proper density',
          element: tallListItems[0]!,
          value: `${tallListItems[0]!.getBoundingClientRect().height}px`,
        }
      : {
          id: 'list-item-height',
          law: 5,
          lawName,
          severity: 'pass',
          title: `List item heights look good (${listItems.length} items checked)`,
          detail: `Most list items are in the 24–40px density range`,
          expected: 'List items: 28–36px',
        }
  );

  // 3. toolbar-height: 36-48px
  const toolbarEls = Array.from(
    root.querySelectorAll('[role="toolbar"], header, nav, .toolbar, [class*="toolbar"], [class*="header"]')
  ).filter((el): el is HTMLElement => !el.closest('.sk-devtools') && isVisible(el));
  const badToolbars = toolbarEls.filter((el) => {
    const h = el.getBoundingClientRect().height;
    return h > 0 && (h < 32 || h > 56);
  });
  checks.push(
    toolbarEls.length === 0
      ? {
          id: 'toolbar-height',
          law: 5,
          lawName,
          severity: 'pass',
          title: 'No toolbar elements found',
          detail: 'No toolbar or header elements detected',
          expected: 'Toolbars: 36–48px height',
        }
      : badToolbars.length > 0
      ? {
          id: 'toolbar-height',
          law: 5,
          lawName,
          severity: 'warning',
          title: `${badToolbars.length} toolbar(s) with non-standard height`,
          detail: `Heights outside 32–56px range`,
          expected: 'Toolbars: 36–48px height',
          element: badToolbars[0]!,
          value: `${badToolbars[0]!.getBoundingClientRect().height}px`,
        }
      : {
          id: 'toolbar-height',
          law: 5,
          lawName,
          severity: 'pass',
          title: `Toolbar heights are appropriate (${toolbarEls.length} checked)`,
          detail: 'Toolbar/header elements are in the 32–56px range',
          expected: 'Toolbars: 36–48px',
        }
  );

  // 4. excessive-padding: elements with padding > 24px
  const excessivePadding = elements.filter((el) => {
    const s = getComputedStyle(el);
    return (
      parsePx(s.paddingTop) > 24 ||
      parsePx(s.paddingBottom) > 24 ||
      parsePx(s.paddingLeft) > 24 ||
      parsePx(s.paddingRight) > 24
    );
  });
  checks.push(
    excessivePadding.length > 5
      ? {
          id: 'excessive-padding',
          law: 5,
          lawName,
          severity: 'warning',
          title: `${excessivePadding.length} element(s) with padding > 24px`,
          detail: 'Excess padding reduces information density',
          expected: 'Padding ≤ 24px in productivity UI; use 4–16px for most elements',
          element: excessivePadding[0],
          value: `${excessivePadding.length} elements`,
        }
      : {
          id: 'excessive-padding',
          law: 5,
          lawName,
          severity: 'pass',
          title: 'Padding density looks good',
          detail: `Only ${excessivePadding.length} element(s) exceed 24px padding`,
          expected: 'Padding ≤ 24px for productivity UI density',
        }
  );

  // 5. text-truncation: constrained-width text without text-overflow:ellipsis
  const constrained = elements.filter((el) => {
    const s = getComputedStyle(el);
    const width = el.getBoundingClientRect().width;
    return width > 0 && width < 200 && s.overflow !== 'visible' && s.whiteSpace === 'nowrap';
  });
  const noTruncation = constrained.filter(
    (el) => getComputedStyle(el).textOverflow !== 'ellipsis'
  );
  checks.push(
    noTruncation.length > 3
      ? {
          id: 'text-truncation',
          law: 5,
          lawName,
          severity: 'warning',
          title: `${noTruncation.length} constrained text element(s) without ellipsis`,
          detail: 'Narrow text elements should use text-overflow: ellipsis to prevent clipping',
          expected: 'All constrained-width nowrap text: text-overflow: ellipsis',
          element: noTruncation[0],
          value: String(noTruncation.length),
        }
      : {
          id: 'text-truncation',
          law: 5,
          lawName,
          severity: 'pass',
          title: 'Text truncation looks good',
          detail: 'Constrained text elements use ellipsis or have sufficient width',
          expected: 'Constrained text: text-overflow: ellipsis',
        }
  );

  return checks;
}

function checkLaw6Motion(root: HTMLElement, elements: HTMLElement[]): UxAuditCheck[] {
  const checks: UxAuditCheck[] = [];
  const lawName = 'Motion';

  const interactive = getInteractiveElements(root);

  // 1. transition-duration: 100-300ms range
  const badDurationEls = interactive.filter((el) => {
    const durations = getComputedStyle(el).transitionDuration.split(',');
    return durations.some((d) => {
      const ms = parseDurationMs(d);
      return ms > 0 && ms > 300;
    });
  });
  checks.push(
    badDurationEls.length > 0
      ? {
          id: 'transition-duration',
          law: 6,
          lawName,
          severity: 'warning',
          title: `${badDurationEls.length} interactive element(s) with transition > 300ms`,
          detail: 'Slow transitions hurt perceived responsiveness',
          expected: 'Interactive element transitions: 100–300ms (target: 150ms)',
          element: badDurationEls[0]!,
          value: getComputedStyle(badDurationEls[0]!).transitionDuration,
        }
      : {
          id: 'transition-duration',
          law: 6,
          lawName,
          severity: 'pass',
          title: 'Transition durations are appropriate',
          detail: 'Interactive elements use transitions within 100–300ms',
          expected: 'Transitions: 100–300ms',
        }
  );

  // 2. active-scale: buttons should have transforms defined
  const buttonsWithTransform = interactive.filter((el) => {
    const s = getComputedStyle(el);
    return s.transform !== 'none' || s.transitionProperty.includes('transform');
  });
  checks.push({
    id: 'active-scale',
    law: 6,
    lawName,
    severity: buttonsWithTransform.length > 0 ? 'pass' : 'warning',
    title:
      buttonsWithTransform.length > 0
        ? `${buttonsWithTransform.length} element(s) with transform animations`
        : 'No transform animations on interactive elements',
    detail:
      buttonsWithTransform.length > 0
        ? 'Interactive elements use transforms for press states'
        : 'Consider adding scale(0.98) on :active for tactile press feedback',
    expected: 'Buttons: scale(0.98) transform on :active state',
    value: String(buttonsWithTransform.length),
  });

  // 3. easing-function: should use ease/cubic-bezier, not linear
  const linearTransitions = interactive.filter((el) => {
    const timing = getComputedStyle(el).transitionTimingFunction;
    return timing === 'linear';
  });
  checks.push(
    linearTransitions.length > 2
      ? {
          id: 'easing-function',
          law: 6,
          lawName,
          severity: 'warning',
          title: `${linearTransitions.length} element(s) use linear easing`,
          detail: 'Linear transitions feel mechanical and cheap',
          expected: 'Use ease, ease-out, or cubic-bezier for natural motion',
          element: linearTransitions[0],
          value: String(linearTransitions.length),
        }
      : {
          id: 'easing-function',
          law: 6,
          lawName,
          severity: 'pass',
          title: 'Easing functions look good',
          detail: 'Interactive elements use ease/cubic-bezier timing functions',
          expected: 'ease, ease-out, or cubic-bezier (not linear)',
        }
  );

  // 4. reduced-motion: check for prefers-reduced-motion in stylesheets
  const hasReducedMotion = stylesheetContainsPattern(/prefers-reduced-motion/);
  checks.push({
    id: 'reduced-motion',
    law: 6,
    lawName,
    severity: hasReducedMotion ? 'pass' : 'warning',
    title: hasReducedMotion
      ? 'prefers-reduced-motion media query found'
      : 'No prefers-reduced-motion media query found',
    detail: hasReducedMotion
      ? 'Stylesheets respect user motion preferences'
      : 'Add @media (prefers-reduced-motion: reduce) to disable animations for sensitive users',
    expected: '@media (prefers-reduced-motion: reduce) { /* zero durations */ }',
    value: hasReducedMotion ? 'present' : 'missing',
  });

  return checks;
}

function checkLaw7Keyboard(root: HTMLElement, elements: HTMLElement[]): UxAuditCheck[] {
  const checks: UxAuditCheck[] = [];
  const lawName = 'Keyboard';

  // 1. focus-visible-vs-focus
  const hasFocusVisible = stylesheetContainsPattern(/:focus-visible/);
  const hasFocusOnly = stylesheetContainsPattern(/:focus[^-]/) || stylesheetContainsPattern(/:focus$/m);
  checks.push({
    id: 'focus-visible-vs-focus',
    law: 7,
    lawName,
    severity: hasFocusVisible ? 'pass' : 'warning',
    title: hasFocusVisible ? ':focus-visible styles found' : 'No :focus-visible styles found',
    detail: hasFocusVisible
      ? 'Keyboard focus rings are properly scoped to :focus-visible'
      : hasFocusOnly
      ? 'Only :focus found — consider :focus-visible to hide rings on mouse click'
      : 'No focus ring styles detected — keyboard navigation may be inaccessible',
    expected: 'Use :focus-visible for focus rings (visible on keyboard, hidden on mouse)',
  });

  // 2. shortcut-hints: kbd elements or aria-keyshortcuts
  const kbdEls = Array.from(root.querySelectorAll('kbd, [aria-keyshortcuts]')).filter(
    (el) => !el.closest('.sk-devtools')
  );
  checks.push({
    id: 'shortcut-hints',
    law: 7,
    lawName,
    severity: kbdEls.length >= 3 ? 'pass' : kbdEls.length >= 1 ? 'warning' : 'warning',
    title: `${kbdEls.length} keyboard shortcut hint(s) found`,
    detail:
      kbdEls.length >= 3
        ? 'Good keyboard shortcut discoverability'
        : kbdEls.length > 0
        ? 'Some shortcut hints exist — add more for better discoverability'
        : 'No <kbd> or aria-keyshortcuts elements found — consider adding shortcut hints',
    expected: 'Show keyboard shortcuts via <kbd> elements next to actions',
    value: String(kbdEls.length),
  });

  // 3. tab-index-negative: tabindex="-1" on visible, non-hidden elements
  const negTabIndex = Array.from(root.querySelectorAll('[tabindex="-1"]')).filter(
    (el): el is HTMLElement =>
      !el.closest('.sk-devtools') &&
      isVisible(el) &&
      getComputedStyle(el).display !== 'none'
  );
  checks.push({
    id: 'tab-index-negative',
    law: 7,
    lawName,
    severity: negTabIndex.length <= 5 ? 'pass' : 'warning',
    title: `${negTabIndex.length} visible element(s) with tabindex="-1"`,
    detail:
      negTabIndex.length <= 5
        ? 'tabindex="-1" usage appears intentional'
        : 'Many visible elements removed from tab order — verify accessibility',
    expected: 'tabindex="-1" should only be on programmatically focused elements',
    value: String(negTabIndex.length),
  });

  // 4. command-palette: presence of combobox or command-palette component
  const cmdPalette = Array.from(
    root.querySelectorAll('[role="combobox"], [class*="command-palette"], [class*="sk-command"]')
  ).filter((el) => !el.closest('.sk-devtools'));
  checks.push({
    id: 'command-palette',
    law: 7,
    lawName,
    severity: cmdPalette.length > 0 ? 'pass' : 'warning',
    title: cmdPalette.length > 0 ? 'Command palette found' : 'No command palette detected',
    detail:
      cmdPalette.length > 0
        ? 'A command palette or combobox overlay is present'
        : 'Consider adding a ⌘K command palette for power-user keyboard navigation',
    expected: 'Command palette accessible via ⌘K / Ctrl+K',
    value: String(cmdPalette.length),
  });

  return checks;
}

function checkLaw8Sidebar(root: HTMLElement, elements: HTMLElement[]): UxAuditCheck[] {
  const checks: UxAuditCheck[] = [];
  const lawName = 'Sidebar';

  // Find sidebar candidates
  const sidebarEl = Array.from(
    root.querySelectorAll(
      '[role="navigation"], [role="complementary"], nav, aside, .sidebar, [class*="sidebar"], [class*="sk-sidebar"]'
    )
  ).find((el): el is HTMLElement => !el.closest('.sk-devtools') && isVisible(el));

  // 1. sidebar-item-height
  if (sidebarEl) {
    const sidebarItems = Array.from(
      sidebarEl.querySelectorAll('a, button, li, [role="treeitem"], [role="menuitem"], [class*="item"]')
    ).filter((el): el is HTMLElement => isVisible(el));
    const badItems = sidebarItems.filter((el) => {
      const h = el.getBoundingClientRect().height;
      return h > 0 && (h < 24 || h > 42);
    });
    checks.push(
      sidebarItems.length === 0
        ? {
            id: 'sidebar-item-height',
            law: 8,
            lawName,
            severity: 'pass',
            title: 'No sidebar items to check',
            detail: 'Sidebar found but no item elements detected inside',
            expected: 'Sidebar items: 28–36px height',
          }
        : badItems.length > 2
        ? {
            id: 'sidebar-item-height',
            law: 8,
            lawName,
            severity: 'warning',
            title: `${badItems.length} sidebar item(s) with non-standard height`,
            detail: `${badItems.length}/${sidebarItems.length} items outside 24–42px range`,
            expected: 'Sidebar items: 28–36px height',
            element: badItems[0]!,
            value: `${badItems[0]!.getBoundingClientRect().height}px`,
          }
        : {
            id: 'sidebar-item-height',
            law: 8,
            lawName,
            severity: 'pass',
            title: `Sidebar item heights OK (${sidebarItems.length} items)`,
            detail: 'Sidebar items are within the 24–42px density range',
            expected: 'Sidebar items: 28–36px',
          }
    );
  } else {
    checks.push({
      id: 'sidebar-item-height',
      law: 8,
      lawName,
      severity: 'pass',
      title: 'No sidebar detected',
      detail: 'This app may not use a sidebar — law 8 checks are skipped',
      expected: 'Sidebar items: 28–36px height (if sidebar exists)',
    });
  }

  // 2. active-pattern: active sidebar item should have border-left or accent
  if (sidebarEl) {
    const activeItem = sidebarEl.querySelector(
      '[aria-selected="true"], [aria-current="page"], .active, [class*="--active"]'
    ) as HTMLElement | null;
    if (activeItem) {
      const s = getComputedStyle(activeItem);
      const hasBorderAccent =
        s.borderLeftWidth !== '0px' ||
        s.borderLeftColor === getComputedStyle(document.documentElement).getPropertyValue('--sk-accent').trim();
      const hasAccentBg = s.backgroundColor.includes('var(--sk-accent') || !isMonochromatic(s.backgroundColor);
      checks.push({
        id: 'active-pattern',
        law: 8,
        lawName,
        severity: hasBorderAccent || hasAccentBg ? 'pass' : 'warning',
        title:
          hasBorderAccent || hasAccentBg
            ? 'Active sidebar item has accent indicator'
            : 'Active sidebar item may lack clear indicator',
        detail:
          hasBorderAccent
            ? 'Active item has border-left accent indicator'
            : hasAccentBg
            ? 'Active item has accent background'
            : 'Active item may not be visually distinct — add border-left or accent background',
        expected: 'Active sidebar item: accent-muted background + 2px left accent border',
      });
    } else {
      checks.push({
        id: 'active-pattern',
        law: 8,
        lawName,
        severity: 'pass',
        title: 'No active sidebar item found',
        detail: 'No element with aria-selected, aria-current, or .active class in sidebar',
        expected: 'Active sidebar item: accent-muted background + 2px left accent border',
      });
    }
  } else {
    checks.push({
      id: 'active-pattern',
      law: 8,
      lawName,
      severity: 'pass',
      title: 'No sidebar detected',
      detail: 'Sidebar active pattern check skipped',
      expected: 'Active item: border-left accent indicator',
    });
  }

  // 3. sidebar-width: 180-260px
  if (sidebarEl) {
    const w = sidebarEl.getBoundingClientRect().width;
    checks.push({
      id: 'sidebar-width',
      law: 8,
      lawName,
      severity: w >= 160 && w <= 280 ? 'pass' : w >= 48 ? 'warning' : 'warning',
      title: `Sidebar width: ${Math.round(w)}px`,
      detail:
        w >= 160 && w <= 280
          ? `Sidebar at ${Math.round(w)}px is within the ideal range`
          : w >= 48
          ? `Sidebar at ${Math.round(w)}px may be collapsed or too narrow`
          : 'Sidebar may be hidden or collapsed',
      expected: 'Sidebar: 180–260px wide (or 48px icon strip when collapsed)',
      value: `${Math.round(w)}px`,
    });
  } else {
    checks.push({
      id: 'sidebar-width',
      law: 8,
      lawName,
      severity: 'pass',
      title: 'No sidebar detected',
      detail: 'Sidebar width check skipped',
      expected: 'Sidebar: 180–260px wide',
    });
  }

  return checks;
}

function checkLaw9Status(root: HTMLElement, elements: HTMLElement[]): UxAuditCheck[] {
  const checks: UxAuditCheck[] = [];
  const lawName = 'Status';

  // Find status bar candidates
  const statusBarEl = Array.from(
    root.querySelectorAll(
      '[role="status"], .status-bar, [class*="status-bar"], [class*="statusbar"], [class*="sk-status"]'
    )
  ).find((el): el is HTMLElement => !el.closest('.sk-devtools') && isVisible(el));

  // 1. status-bar-present
  checks.push({
    id: 'status-bar-present',
    law: 9,
    lawName,
    severity: statusBarEl ? 'pass' : 'warning',
    title: statusBarEl ? 'Status bar found' : 'No status bar detected',
    detail: statusBarEl
      ? 'A status bar element is present in the layout'
      : 'Consider adding a status bar to show git branch, model, connection state',
    expected: 'Status bar: fixed 24px at bottom of window',
    element: statusBarEl,
  });

  // 2. status-bar-height
  if (statusBarEl) {
    const h = statusBarEl.getBoundingClientRect().height;
    checks.push({
      id: 'status-bar-height',
      law: 9,
      lawName,
      severity: h >= 18 && h <= 32 ? 'pass' : 'warning',
      title: `Status bar height: ${Math.round(h)}px`,
      detail:
        h >= 18 && h <= 32
          ? `Status bar at ${Math.round(h)}px is in the ideal range`
          : `Status bar at ${Math.round(h)}px — ideal is 20–28px`,
      expected: 'Status bar: 20–28px height',
      element: statusBarEl,
      value: `${Math.round(h)}px`,
    });
  } else {
    checks.push({
      id: 'status-bar-height',
      law: 9,
      lawName,
      severity: 'pass',
      title: 'No status bar to check height',
      detail: 'Status bar element not found',
      expected: 'Status bar: 20–28px height',
    });
  }

  // 3. status-bar-monospace
  if (statusBarEl) {
    const fontFamily = getComputedStyle(statusBarEl).fontFamily.toLowerCase();
    const isMonospace =
      fontFamily.includes('mono') ||
      fontFamily.includes('courier') ||
      fontFamily.includes('console') ||
      fontFamily.includes('menlo') ||
      fontFamily.includes('code');
    checks.push({
      id: 'status-bar-monospace',
      law: 9,
      lawName,
      severity: isMonospace ? 'pass' : 'warning',
      title: isMonospace ? 'Status bar uses monospace font' : 'Status bar may not use monospace',
      detail: `Status bar font-family: ${getComputedStyle(statusBarEl).fontFamily.split(',')[0]}`,
      expected: 'Status bar: monospace font for aligned data display',
      element: statusBarEl,
      value: getComputedStyle(statusBarEl).fontFamily,
    });
  } else {
    checks.push({
      id: 'status-bar-monospace',
      law: 9,
      lawName,
      severity: 'pass',
      title: 'No status bar to check font',
      detail: 'Status bar element not found',
      expected: 'Status bar: monospace font',
    });
  }

  return checks;
}

function checkLaw10EmptyStates(root: HTMLElement, elements: HTMLElement[]): UxAuditCheck[] {
  const checks: UxAuditCheck[] = [];
  const lawName = 'Empty States';

  // Find empty state candidates
  const emptyStateEls = Array.from(
    root.querySelectorAll(
      '[class*="empty-state"], [class*="empty_state"], [class*="sk-empty"], [data-empty], [aria-label*="empty"]'
    )
  ).filter((el): el is HTMLElement => !el.closest('.sk-devtools') && isVisible(el));

  // 1. empty-state-pattern: should have icon + text + action button
  if (emptyStateEls.length > 0) {
    const wellFormed = emptyStateEls.filter((el) => {
      const hasText = el.textContent?.trim().length > 0;
      const hasButton = el.querySelector('button, a, [role="button"]') !== null;
      const hasIcon = el.querySelector('svg, img, [class*="icon"], [aria-hidden]') !== null;
      return hasText && (hasButton || hasIcon);
    });
    checks.push({
      id: 'empty-state-pattern',
      law: 10,
      lawName,
      severity: wellFormed.length === emptyStateEls.length ? 'pass' : 'warning',
      title: `${emptyStateEls.length} empty state(s) found, ${wellFormed.length} well-formed`,
      detail:
        wellFormed.length === emptyStateEls.length
          ? 'All empty states have icon + text pattern'
          : `${emptyStateEls.length - wellFormed.length} empty state(s) may be missing icon or action button`,
      expected: 'Empty states: icon (48px, 0.4 opacity) + title + subtitle + action button',
      element: emptyStateEls[0],
      value: `${emptyStateEls.length} found`,
    });
  } else {
    checks.push({
      id: 'empty-state-pattern',
      law: 10,
      lawName,
      severity: 'pass',
      title: 'No empty states visible',
      detail: 'No empty state elements found in current view — may be present in other states',
      expected: 'Empty states: icon + title + action button when content is absent',
    });
  }

  // 2. empty-state-centered: empty states should be centered
  if (emptyStateEls.length > 0) {
    const centeredEls = emptyStateEls.filter((el) => {
      const s = getComputedStyle(el);
      const isFlexCenter =
        s.display === 'flex' &&
        (s.justifyContent === 'center' || s.alignItems === 'center');
      const isTextCenter = s.textAlign === 'center';
      const isMarginAuto = s.marginLeft === 'auto' && s.marginRight === 'auto';
      return isFlexCenter || isTextCenter || isMarginAuto;
    });
    checks.push({
      id: 'empty-state-centered',
      law: 10,
      lawName,
      severity: centeredEls.length === emptyStateEls.length ? 'pass' : 'warning',
      title: `${centeredEls.length}/${emptyStateEls.length} empty state(s) centered`,
      detail:
        centeredEls.length === emptyStateEls.length
          ? 'All empty states appear to be centered in their container'
          : 'Some empty states may not be centered — check flex/grid alignment',
      expected: 'Empty states: centered (flex with justify/align center)',
      element: centeredEls.length < emptyStateEls.length ? emptyStateEls.find((el) => !centeredEls.includes(el)) : undefined,
    });
  } else {
    checks.push({
      id: 'empty-state-centered',
      law: 10,
      lawName,
      severity: 'pass',
      title: 'No empty states to check centering',
      detail: 'No empty state elements visible in current view',
      expected: 'Empty states: centered in container',
    });
  }

  return checks;
}

// ─── Score Calculation ────────────────────────────────────────────────────────

function calculateLawScores(checks: UxAuditCheck[]): LawScore[] {
  const LAW_NAMES: Record<number, string> = {
    1: 'Speed',
    2: 'Depth',
    3: 'Typography',
    4: 'Color',
    5: 'Density',
    6: 'Motion',
    7: 'Keyboard',
    8: 'Sidebar',
    9: 'Status',
    10: 'Empty States',
  };

  const byLaw = new Map<number, UxAuditCheck[]>();
  for (let i = 1; i <= 10; i++) byLaw.set(i, []);
  for (const check of checks) {
    byLaw.get(check.law)?.push(check);
  }

  return Array.from(byLaw.entries()).map(([law, lawChecks]) => {
    const passCount = lawChecks.filter((c) => c.severity === 'pass').length;
    const violationCount = lawChecks.filter((c) => c.severity === 'violation').length;
    const warningCount = lawChecks.filter((c) => c.severity === 'warning').length;

    // Score: pass=1, warning=0.5, violation=0
    const weighted = passCount * 1 + warningCount * 0.5;
    const total = lawChecks.length;
    const score = total > 0 ? Math.round((weighted / total) * 10) : 10;

    return {
      law,
      name: LAW_NAMES[law] ?? `Law ${law}`,
      score,
      checks: [...lawChecks].sort((a, b) => {
        const order = { violation: 0, warning: 1, pass: 2 };
        return order[a.severity] - order[b.severity];
      }),
      passCount,
      violationCount,
      warningCount,
    };
  });
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Run the full UX audit against the given root element.
 * Pure function — no SolidJS dependency.
 */
export function runUxAudit(root: HTMLElement): UxAuditResult {
  const elements = getVisibleElements(root);

  const checks: UxAuditCheck[] = [
    ...checkLaw1Speed(root, elements),
    ...checkLaw2Depth(root, elements),
    ...checkLaw3Typography(root, elements),
    ...checkLaw4Color(root, elements),
    ...checkLaw5Density(root, elements),
    ...checkLaw6Motion(root, elements),
    ...checkLaw7Keyboard(root, elements),
    ...checkLaw8Sidebar(root, elements),
    ...checkLaw9Status(root, elements),
    ...checkLaw10EmptyStates(root, elements),
  ];

  const laws = calculateLawScores(checks);
  const overallScore = Math.round(
    (laws.reduce((sum, l) => sum + l.score, 0) / laws.length) * 10
  );

  return {
    overallScore,
    laws,
    totalChecks: checks.length,
    totalViolations: checks.filter((c) => c.severity === 'violation').length,
    totalWarnings: checks.filter((c) => c.severity === 'warning').length,
    totalPasses: checks.filter((c) => c.severity === 'pass').length,
    timestamp: Date.now(),
  };
}
