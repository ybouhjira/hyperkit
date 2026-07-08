/**
 * Layout math for the sequence diagram.
 *
 * Pure — no SVG, no SolidJS. Takes `SequenceData` plus geometry constants
 * and returns the x of each actor lifeline, the y of each step, and concrete
 * coordinates for each message arrow and note rectangle. Keeping this
 * standalone makes the arrow routing (especially self-loops and spanning
 * notes) trivially unit-testable.
 */

import type { SequenceData, SequenceStep } from './types';

export interface SequenceGeometry {
  readonly actorSpacing: number;
  readonly firstActorX: number;
  readonly headerHeight: number;
  readonly headerPaddingY: number;
  readonly stepGap: number;
  readonly firstStepY: number;
  readonly selfLoopWidth: number;
  readonly selfLoopHeight: number;
  readonly notePaddingX: number;
  readonly notePaddingY: number;
  readonly noteMinWidth: number;
  readonly footerPadding: number;
}

export const DEFAULT_GEOMETRY: SequenceGeometry = {
  actorSpacing: 180,
  firstActorX: 100,
  headerHeight: 36,
  headerPaddingY: 8,
  stepGap: 44,
  firstStepY: 64,
  selfLoopWidth: 40,
  selfLoopHeight: 28,
  notePaddingX: 10,
  notePaddingY: 6,
  noteMinWidth: 120,
  footerPadding: 24,
};

export interface LaidOutActor {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly tone?: string;
}

export interface LaidOutMessage {
  readonly type: 'message';
  readonly index: number;
  readonly number?: number;
  readonly label: string;
  readonly kind: 'sync' | 'async' | 'return' | 'self';
  readonly tone?: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  /** For self-loop: the outer x of the loop rectangle. */
  readonly loopX?: number;
  readonly loopHeight?: number;
}

export interface LaidOutNote {
  readonly type: 'note';
  readonly index: number;
  readonly text: string;
  readonly tone?: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type LaidOutStep = LaidOutMessage | LaidOutNote;

export interface SequenceLayout {
  /** Leftmost x of any rendered element (negative when a note extends left of the first actor). */
  readonly minX: number;
  readonly width: number;
  readonly height: number;
  readonly geometry: SequenceGeometry;
  readonly actors: readonly LaidOutActor[];
  readonly steps: readonly LaidOutStep[];
  /** y of the top of each actor's lifeline. */
  readonly lifelineTop: number;
  /** y of the bottom of each actor's lifeline. */
  readonly lifelineBottom: number;
}

function stepHeight(step: SequenceStep, geom: SequenceGeometry): number {
  if (step.type === 'message') {
    // Infer `self` the same way computeLayout does, so implicit self
    // messages (from === to) reserve loop height too.
    const kind = step.kind ?? (step.from === step.to ? 'self' : 'sync');
    return kind === 'self' ? geom.selfLoopHeight : 0;
  }
  // Notes get extra vertical room relative to a plain message line.
  return geom.notePaddingY * 2 + 14;
}

export function computeLayout(
  data: SequenceData,
  geom: SequenceGeometry = DEFAULT_GEOMETRY
): SequenceLayout {
  const actorX = new Map<string, number>();
  const actors: LaidOutActor[] = data.actors.map((a, i) => {
    const x = geom.firstActorX + i * geom.actorSpacing;
    actorX.set(a.id, x);
    return { id: a.id, label: a.label, x, tone: a.tone };
  });

  const lifelineTop = geom.headerHeight + geom.headerPaddingY;
  const steps: LaidOutStep[] = [];

  let y = geom.firstStepY;
  let msgNumber = 0;

  data.steps.forEach((step, i) => {
    const extra = stepHeight(step, geom);
    if (step.type === 'message') {
      msgNumber += 1;
      const fromX = actorX.get(step.from) ?? geom.firstActorX;
      const toX = actorX.get(step.to) ?? fromX;
      const kind = step.kind ?? (step.from === step.to ? 'self' : 'sync');

      if (kind === 'self') {
        steps.push({
          type: 'message',
          index: i,
          number: data.autonumber ? msgNumber : undefined,
          label: step.label,
          kind,
          tone: step.tone,
          x1: fromX,
          y1: y,
          x2: fromX,
          y2: y + geom.selfLoopHeight,
          loopX: fromX + geom.selfLoopWidth,
          loopHeight: geom.selfLoopHeight,
        });
      } else {
        steps.push({
          type: 'message',
          index: i,
          number: data.autonumber ? msgNumber : undefined,
          label: step.label,
          kind,
          tone: step.tone,
          x1: fromX,
          y1: y,
          x2: toX,
          y2: y,
        });
      }
      y += geom.stepGap + extra;
    } else {
      const anchor = step.anchor;
      let x: number;
      let width: number;
      if (anchor.kind === 'over') {
        const ax = actorX.get(anchor.actor) ?? geom.firstActorX;
        width = Math.max(geom.noteMinWidth, step.text.length * 6 + geom.notePaddingX * 2);
        x = ax - width / 2;
      } else if (anchor.kind === 'span') {
        const fx = actorX.get(anchor.from) ?? geom.firstActorX;
        const tx = actorX.get(anchor.to) ?? fx;
        const left = Math.min(fx, tx);
        const right = Math.max(fx, tx);
        width = right - left + geom.noteMinWidth;
        x = left - geom.noteMinWidth / 2;
      } else {
        const ax = actorX.get(anchor.actor) ?? geom.firstActorX;
        width = Math.max(geom.noteMinWidth, step.text.length * 6 + geom.notePaddingX * 2);
        x =
          anchor.side === 'left' ? ax - width - geom.actorSpacing / 2 : ax + geom.actorSpacing / 2;
      }
      const height = geom.notePaddingY * 2 + 16;
      steps.push({
        type: 'note',
        index: i,
        text: step.text,
        tone: step.tone,
        x,
        y: y - height / 2,
        width,
        height,
      });
      y += geom.stepGap + extra;
    }
  });

  const lifelineBottom = y + geom.footerPadding;
  const lastActor = actors[actors.length - 1];
  const actorWidth = (lastActor?.x ?? geom.firstActorX) + geom.firstActorX;

  // Notes may extend past the actor columns on either side — grow the
  // bounds so nothing renders outside the viewBox.
  let minX = 0;
  let maxX = actorWidth;
  for (const s of steps) {
    if (s.type === 'note') {
      minX = Math.min(minX, s.x - geom.notePaddingX);
      maxX = Math.max(maxX, s.x + s.width + geom.notePaddingX);
    }
  }

  return {
    minX,
    width: maxX,
    height: lifelineBottom + geom.footerPadding,
    geometry: geom,
    actors,
    steps,
    lifelineTop,
    lifelineBottom,
  };
}
