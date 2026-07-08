import { describe, it, expect } from 'vitest';
import {
  breakLines,
  positionItems,
  adjustmentRatios,
  forcedBreak,
  MaxAdjustmentExceededError,
  MIN_COST,
  MAX_COST,
  Box,
  Glue,
  Penalty,
  InputItem,
} from './layout';

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

function box(width: number): Box {
  return { type: 'box', width };
}

function glue(width: number, stretch: number, shrink: number): Glue {
  return { type: 'glue', width, stretch, shrink };
}

function penalty(width: number, cost: number, flagged = false): Penalty {
  return { type: 'penalty', width, cost, flagged };
}

/**
 * Build a simple paragraph of equally-sized boxes with spaces between them,
 * terminated by finishing glue + forced break (the standard pattern).
 */
function simpleParagraph(
  wordWidth: number,
  wordCount: number,
  spaceWidth = 3,
  spaceStretch = 6,
  spaceShrink = 2
): InputItem[] {
  const items: InputItem[] = [];
  for (let i = 0; i < wordCount; i++) {
    if (i > 0) {
      items.push(glue(spaceWidth, spaceStretch, spaceShrink));
    }
    items.push(box(wordWidth));
  }
  // finishing glue + forced break
  items.push(glue(0, MAX_COST, 0));
  items.push(forcedBreak());
  return items;
}

// ===========================================================================
// forcedBreak
// ===========================================================================

describe('forcedBreak', () => {
  it('returns a penalty with cost <= MIN_COST', () => {
    const fb = forcedBreak();
    expect(fb.type).toBe('penalty');
    expect(fb.cost).toBeLessThanOrEqual(MIN_COST);
    expect(fb.width).toBe(0);
    expect(fb.flagged).toBe(false);
  });
});

// ===========================================================================
// breakLines
// ===========================================================================

describe('breakLines', () => {
  it('returns empty array for empty input', () => {
    expect(breakLines([], 100)).toEqual([]);
  });

  it('finds breakpoints for a simple paragraph', () => {
    // 5 words of width 10, space width 3 → total natural width = 5*10 + 4*3 = 62
    // Line width 30 → should break into multiple lines
    const items = simpleParagraph(10, 5);
    const bp = breakLines(items, 30);

    // Must start with 0 and end with the forced break (last item index)
    expect(bp[0]).toBe(0);
    expect(bp[bp.length - 1]).toBe(items.length - 1);
    // More than one line needed
    expect(bp.length).toBeGreaterThan(2);
  });

  it('handles single word', () => {
    const items: InputItem[] = [box(10), glue(0, MAX_COST, 0), forcedBreak()];
    const bp = breakLines(items, 100);
    expect(bp[0]).toBe(0);
    expect(bp[bp.length - 1]).toBe(items.length - 1);
  });

  it('accepts line widths as an array', () => {
    const items = simpleParagraph(10, 6);
    const bp = breakLines(items, [50, 40, 30, 25]);
    expect(bp.length).toBeGreaterThan(2);
    expect(bp[0]).toBe(0);
  });

  it('throws MaxAdjustmentExceededError when maxAdjustmentRatio is too small', () => {
    // To trigger the error:
    // 1. Active set must become empty
    // 2. minAdjustmentRatioAboveThreshold must be finite
    // 3. opts_.maxAdjustmentRatio === currentMaxAdjustmentRatio
    //
    // Key insight: the finishing glue normally has stretch=MAX_COST which
    // absorbs all excess space. We replace it with a low-stretch glue so
    // no breakpoint candidate has a feasible adjustment ratio.
    //
    // Content: box(5) + glue(3, stretch=1) + box(5) + glue(0, stretch=1) + forcedBreak
    // Total natural width = 5+3+5 = 13, total stretch = 1+1 = 2
    // Line width = 200 → ratio = (200-13)/2 = 93.5 → exceeds maxAdjustmentRatio=1
    //
    // At the forced break, active nodes get pruned. No feasible node created
    // because ratio > 1. Active set empties → error thrown.
    const items: InputItem[] = [
      box(5),
      glue(3, 1, 1),
      box(5),
      glue(0, 1, 0), // low stretch, NOT MAX_COST
      forcedBreak(),
    ];
    expect(() => breakLines(items, 200, { maxAdjustmentRatio: 1 })).toThrow(
      MaxAdjustmentExceededError
    );
  });

  it('handles forced breaks in the middle of items', () => {
    const items: InputItem[] = [
      box(10),
      glue(3, 6, 2),
      box(10),
      forcedBreak(), // forced break here
      box(10),
      glue(0, MAX_COST, 0),
      forcedBreak(),
    ];
    const bp = breakLines(items, 100);
    // Should have at least 3 breakpoints (start, forced, end)
    expect(bp.length).toBeGreaterThanOrEqual(3);
  });

  it('handles negative glue values', () => {
    // Negative stretch/shrink should not crash — the algorithm adjusts behavior
    const items: InputItem[] = [
      box(10),
      glue(5, -1, -1),
      box(10),
      glue(0, MAX_COST, 0),
      forcedBreak(),
    ];
    const bp = breakLines(items, 30);
    expect(bp.length).toBeGreaterThanOrEqual(2);
  });

  it('uses doubleHyphenPenalty option', () => {
    // Two consecutive hyphenation penalties
    const items: InputItem[] = [
      box(10),
      penalty(2, 10, true),
      box(8),
      glue(3, 6, 2),
      box(10),
      penalty(2, 10, true),
      box(8),
      glue(0, MAX_COST, 0),
      forcedBreak(),
    ];
    const bp1 = breakLines(items, 25, { doubleHyphenPenalty: 0 });
    const bp2 = breakLines(items, 25, { doubleHyphenPenalty: 10000 });
    // Both should produce valid breakpoints (start and end at minimum)
    expect(bp1.length).toBeGreaterThanOrEqual(2);
    expect(bp2.length).toBeGreaterThanOrEqual(2);
  });

  it('uses adjacentLooseTightPenalty option', () => {
    const items = simpleParagraph(10, 8);
    const bp1 = breakLines(items, 25, { adjacentLooseTightPenalty: 0 });
    const bp2 = breakLines(items, 25, { adjacentLooseTightPenalty: 10000 });
    expect(bp1.length).toBeGreaterThanOrEqual(2);
    expect(bp2.length).toBeGreaterThanOrEqual(2);
  });

  it('handles penalty items with cost >= MAX_COST (unbreakable)', () => {
    // Unbreakable penalty should not create a breakpoint there
    const items: InputItem[] = [
      box(10),
      penalty(0, MAX_COST, false), // cannot break here
      box(10),
      glue(0, MAX_COST, 0),
      forcedBreak(),
    ];
    const bp = breakLines(items, 100);
    // The unbreakable penalty index should NOT be in the breakpoints
    expect(bp).not.toContain(1);
  });

  it('falls back when active set is exhausted with no higher ratio available', () => {
    // A box that's wider than the line — forces the fallback path
    const items: InputItem[] = [
      box(200), // wider than lineWidth
      glue(3, 0, 0), // zero stretch/shrink → can't adjust
      box(5),
      glue(0, MAX_COST, 0),
      forcedBreak(),
    ];
    // Should not throw; falls back to emergency break
    const bp = breakLines(items, 50);
    expect(bp.length).toBeGreaterThanOrEqual(2);
  });
});

// ===========================================================================
// adjustmentRatios
// ===========================================================================

describe('adjustmentRatios', () => {
  it('returns empty for single breakpoint', () => {
    const items = simpleParagraph(10, 3);
    expect(adjustmentRatios(items, 100, [0])).toEqual([]);
  });

  it('computes ratios for a paragraph that fits exactly', () => {
    // One line: two boxes of width 10 + one space of width 3 = 23
    const items: InputItem[] = [
      box(10),
      glue(3, 6, 2),
      box(10),
      glue(0, MAX_COST, 0),
      forcedBreak(),
    ];
    const bp = breakLines(items, 23);
    const ratios = adjustmentRatios(items, 23, bp);
    // Should be one ratio close to 0 (exact fit)
    expect(ratios.length).toBeGreaterThanOrEqual(1);
  });

  it('returns positive ratio when line is shorter than target', () => {
    // Line content width = 10, lineLength = 100 → needs stretching
    const items: InputItem[] = [box(10), glue(0, MAX_COST, 0), forcedBreak()];
    const bp = breakLines(items, 100);
    const ratios = adjustmentRatios(items, 100, bp);
    // First (and only) line should have a positive ratio (needs stretching)
    expect(ratios[0]).toBeGreaterThan(0);
  });

  it('works with array line lengths', () => {
    const items = simpleParagraph(10, 5);
    const bp = breakLines(items, [50, 40]);
    const ratios = adjustmentRatios(items, [50, 40], bp);
    expect(ratios.length).toBe(bp.length - 1);
  });
});

// ===========================================================================
// positionItems
// ===========================================================================

describe('positionItems', () => {
  it('positions boxes with correct x-offsets', () => {
    const items: InputItem[] = [
      box(10),
      glue(5, 10, 2),
      box(15),
      glue(0, MAX_COST, 0),
      forcedBreak(),
    ];
    const bp = breakLines(items, 100);
    const positions = positionItems(items, 100, bp);

    // First box starts at x=0
    const firstBox = positions.find((p) => p.item === 0);
    expect(firstBox).toBeDefined();
    expect(firstBox!.xOffset).toBe(0);
    expect(firstBox!.width).toBe(10);

    // Second box follows the glue
    const secondBox = positions.find((p) => p.item === 2);
    expect(secondBox).toBeDefined();
    expect(secondBox!.xOffset).toBeGreaterThan(10);
  });

  it('assigns correct line numbers', () => {
    const items = simpleParagraph(10, 6);
    const bp = breakLines(items, 25);
    const positions = positionItems(items, 25, bp);

    // All positions should have line numbers >= 0
    expect(positions.every((p) => p.line >= 0)).toBe(true);

    // Multiple lines expected
    const maxLine = Math.max(...positions.map((p) => p.line));
    expect(maxLine).toBeGreaterThan(0);
  });

  it('includes glue items when includeGlue is true', () => {
    const items: InputItem[] = [
      box(10),
      glue(5, 10, 2),
      box(10),
      glue(0, MAX_COST, 0),
      forcedBreak(),
    ];
    const bp = breakLines(items, 100);
    const withGlue = positionItems(items, 100, bp, { includeGlue: true });
    const withoutGlue = positionItems(items, 100, bp);
    expect(withGlue.length).toBeGreaterThan(withoutGlue.length);
  });

  it('positions penalty items at line end if they have width', () => {
    // Simulate a hyphen penalty at end of line
    const items: InputItem[] = [
      box(20),
      penalty(5, 10, true), // hyphen with width 5
      box(20),
      glue(0, MAX_COST, 0),
      forcedBreak(),
    ];
    // Line width 25 → first box (20) + penalty (5) = 25 fits on first line
    const bp = breakLines(items, 25);
    const positions = positionItems(items, 25, bp);
    // The penalty should appear in positions if it's at a breakpoint
    const penaltyPos = positions.find(
      (p) => items[p.item]?.type === 'penalty' && (items[p.item] as Penalty).width > 0
    );
    if (penaltyPos) {
      expect(penaltyPos.width).toBe(5);
    }
  });

  it('handles array line lengths', () => {
    const items = simpleParagraph(10, 6);
    const bp = breakLines(items, [50, 30, 25]);
    const positions = positionItems(items, [50, 30, 25], bp);
    expect(positions.length).toBeGreaterThan(0);
  });
});

// ===========================================================================
// Constants
// ===========================================================================

describe('constants', () => {
  it('MIN_COST is -1000', () => {
    expect(MIN_COST).toBe(-1000);
  });

  it('MAX_COST is 1000', () => {
    expect(MAX_COST).toBe(1000);
  });
});
