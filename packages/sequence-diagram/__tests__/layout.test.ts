import { describe, it, expect } from 'vitest';
import { computeLayout, DEFAULT_GEOMETRY } from '../src';
import type { LaidOutMessage, LaidOutNote, SequenceData } from '../src';

const G = DEFAULT_GEOMETRY;

const actors = [
  { id: 'a', label: 'Alice' },
  { id: 'b', label: 'Bob' },
  { id: 'c', label: 'Carol' },
];

const message = (from: string, to: string, label = 'msg'): SequenceData['steps'][number] => ({
  type: 'message',
  from,
  to,
  label,
});

describe('computeLayout', () => {
  it('spaces actors horizontally from firstActorX by actorSpacing', () => {
    const layout = computeLayout({ actors, steps: [] });
    expect(layout.actors.map((a) => a.x)).toEqual([
      G.firstActorX,
      G.firstActorX + G.actorSpacing,
      G.firstActorX + 2 * G.actorSpacing,
    ]);
    expect(layout.width).toBe(G.firstActorX + 2 * G.actorSpacing + G.firstActorX);
  });

  it('positions the lifeline top below the actor headers', () => {
    const layout = computeLayout({ actors, steps: [] });
    expect(layout.lifelineTop).toBe(G.headerHeight + G.headerPaddingY);
  });

  it('lays out a message between two actors at firstStepY', () => {
    const layout = computeLayout({ actors, steps: [message('a', 'b')] });
    const m = layout.steps[0] as LaidOutMessage;
    expect(m.type).toBe('message');
    expect(m.x1).toBe(G.firstActorX);
    expect(m.x2).toBe(G.firstActorX + G.actorSpacing);
    expect(m.y1).toBe(G.firstStepY);
    expect(m.y2).toBe(G.firstStepY);
  });

  it('advances y by stepGap between plain messages', () => {
    const layout = computeLayout({
      actors,
      steps: [message('a', 'b'), message('b', 'c')],
    });
    const [m1, m2] = layout.steps as LaidOutMessage[];
    expect(m2!.y1).toBe(m1!.y1 + G.stepGap);
  });

  it('defaults kind to sync for distinct actors and self for same actor', () => {
    const layout = computeLayout({
      actors,
      steps: [message('a', 'b'), message('a', 'a')],
    });
    const [m1, m2] = layout.steps as LaidOutMessage[];
    expect(m1!.kind).toBe('sync');
    expect(m2!.kind).toBe('self');
  });

  it('preserves an explicit message kind', () => {
    const layout = computeLayout({
      actors,
      steps: [{ type: 'message', from: 'b', to: 'a', label: 'ok', kind: 'return' }],
    });
    expect((layout.steps[0] as LaidOutMessage).kind).toBe('return');
  });

  it('routes self messages as a loop with loopX and loopHeight', () => {
    const layout = computeLayout({ actors, steps: [message('b', 'b')] });
    const m = layout.steps[0] as LaidOutMessage;
    const bx = G.firstActorX + G.actorSpacing;
    expect(m.x1).toBe(bx);
    expect(m.x2).toBe(bx);
    expect(m.y2).toBe(m.y1 + G.selfLoopHeight);
    expect(m.loopX).toBe(bx + G.selfLoopWidth);
    expect(m.loopHeight).toBe(G.selfLoopHeight);
  });

  it('gives explicit self messages extra vertical room before the next step', () => {
    const layout = computeLayout({
      actors,
      steps: [
        { type: 'message', from: 'a', to: 'a', label: 'loop', kind: 'self' },
        message('a', 'b'),
      ],
    });
    const [m1, m2] = layout.steps as LaidOutMessage[];
    expect(m2!.y1).toBe(m1!.y1 + G.stepGap + G.selfLoopHeight);
  });

  it('numbers only messages when autonumber is on, skipping notes', () => {
    const layout = computeLayout({
      actors,
      autonumber: true,
      steps: [
        message('a', 'b'),
        { type: 'note', anchor: { kind: 'over', actor: 'a' }, text: 'hi' },
        message('b', 'a'),
      ],
    });
    const numbers = layout.steps.map((s) => (s.type === 'message' ? s.number : undefined));
    expect(numbers).toEqual([1, undefined, 2]);
  });

  it('leaves message numbers undefined without autonumber', () => {
    const layout = computeLayout({ actors, steps: [message('a', 'b')] });
    expect((layout.steps[0] as LaidOutMessage).number).toBeUndefined();
  });

  it('centers an over-note on its actor with a minimum width', () => {
    const layout = computeLayout({
      actors,
      steps: [{ type: 'note', anchor: { kind: 'over', actor: 'b' }, text: 'hi' }],
    });
    const n = layout.steps[0] as LaidOutNote;
    const bx = G.firstActorX + G.actorSpacing;
    expect(n.width).toBe(G.noteMinWidth);
    expect(n.x).toBe(bx - G.noteMinWidth / 2);
    expect(n.height).toBe(G.notePaddingY * 2 + 16);
  });

  it('widens an over-note for long text', () => {
    const text = 'x'.repeat(40);
    const layout = computeLayout({
      actors,
      steps: [{ type: 'note', anchor: { kind: 'over', actor: 'a' }, text }],
    });
    const n = layout.steps[0] as LaidOutNote;
    expect(n.width).toBe(text.length * 6 + G.notePaddingX * 2);
  });

  it('spans a note across two actors regardless of their order', () => {
    const layout = computeLayout({
      actors,
      steps: [{ type: 'note', anchor: { kind: 'span', from: 'c', to: 'a' }, text: 'span' }],
    });
    const n = layout.steps[0] as LaidOutNote;
    const left = G.firstActorX;
    const right = G.firstActorX + 2 * G.actorSpacing;
    expect(n.width).toBe(right - left + G.noteMinWidth);
    expect(n.x).toBe(left - G.noteMinWidth / 2);
  });

  it('places side notes left or right of the anchor actor', () => {
    const layout = computeLayout({
      actors,
      steps: [
        { type: 'note', anchor: { kind: 'side', actor: 'b', side: 'right' }, text: 'r' },
        { type: 'note', anchor: { kind: 'side', actor: 'b', side: 'left' }, text: 'l' },
      ],
    });
    const [right, left] = layout.steps as LaidOutNote[];
    const bx = G.firstActorX + G.actorSpacing;
    expect(right!.x).toBe(bx + G.actorSpacing / 2);
    expect(left!.x).toBe(bx - left!.width - G.actorSpacing / 2);
  });

  it('falls back to firstActorX for unknown actor ids', () => {
    const layout = computeLayout({
      actors,
      steps: [message('ghost', 'b'), message('a', 'phantom')],
    });
    const [m1, m2] = layout.steps as LaidOutMessage[];
    expect(m1!.x1).toBe(G.firstActorX);
    expect(m1!.x2).toBe(G.firstActorX + G.actorSpacing);
    // Unknown target falls back to the source x.
    expect(m2!.x2).toBe(m2!.x1);
  });

  it('handles empty data', () => {
    const layout = computeLayout({ actors: [], steps: [] });
    expect(layout.actors).toHaveLength(0);
    expect(layout.steps).toHaveLength(0);
    expect(layout.width).toBe(G.firstActorX * 2);
    expect(layout.lifelineBottom).toBe(G.firstStepY + G.footerPadding);
    expect(layout.height).toBe(layout.lifelineBottom + G.footerPadding);
  });

  it('grows the lifeline bottom with the number of steps', () => {
    const one = computeLayout({ actors, steps: [message('a', 'b')] });
    const two = computeLayout({ actors, steps: [message('a', 'b'), message('b', 'c')] });
    expect(two.lifelineBottom).toBe(one.lifelineBottom + G.stepGap);
  });

  it('respects custom geometry', () => {
    const layout = computeLayout(
      { actors, steps: [message('a', 'b')] },
      { ...G, actorSpacing: 100, firstActorX: 50, firstStepY: 30 }
    );
    expect(layout.actors.map((a) => a.x)).toEqual([50, 150, 250]);
    expect((layout.steps[0] as LaidOutMessage).y1).toBe(30);
  });

  it('carries actor and step tones through to the layout', () => {
    const layout = computeLayout({
      actors: [{ id: 'a', label: 'A', tone: 'accent' }],
      steps: [
        { type: 'message', from: 'a', to: 'a', label: 'm', tone: 'error' },
        { type: 'note', anchor: { kind: 'over', actor: 'a' }, text: 'n', tone: 'info' },
      ],
    });
    expect(layout.actors[0]!.tone).toBe('accent');
    expect((layout.steps[0] as LaidOutMessage).tone).toBe('error');
    expect((layout.steps[1] as LaidOutNote).tone).toBe('info');
  });
});
