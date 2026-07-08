/**
 * Public types for `@ybouhjira/sequence-diagram`.
 *
 * MVP covers the UML sequence features we actually need today: actors, sync
 * messages (solid arrow), async messages (open arrow), returns (dashed),
 * self-messages (loop back to same actor), and floating notes anchored to one
 * actor or spanning two. Fields that feel "likely future work" (activations,
 * alt/par/loop frames, lifeline create/destroy) are *not* in the type yet —
 * we add them as optional discriminants when a real use case lands.
 */

/**
 * Semantic tone for an arrow/note. Consumers map each tone to concrete colors
 * via `palette`. The component never picks colors.
 */
export type SequenceTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'info';

export interface SequenceToneColors {
  readonly stroke: string;
  readonly fill: string;
  readonly text: string;
}

export type SequencePalette = Readonly<Record<SequenceTone, SequenceToneColors>>;

/** A vertical lifeline. `label` is shown in the header box at the top. */
export interface SequenceActor {
  readonly id: string;
  readonly label: string;
  /** Optional visual tone for the actor header box. */
  readonly tone?: SequenceTone;
}

/**
 * Arrow style:
 * - `sync` — solid line, filled arrowhead (default for UML sync call)
 * - `async` — solid line, open arrowhead
 * - `return` — dashed line, open arrowhead
 * - `self` — loop from an actor back to itself (from === to)
 */
export type SequenceMessageKind = 'sync' | 'async' | 'return' | 'self';

export interface SequenceMessage {
  readonly type: 'message';
  readonly from: string;
  readonly to: string;
  readonly label: string;
  readonly kind?: SequenceMessageKind;
  readonly tone?: SequenceTone;
}

/** Note anchored to a single actor, or spanning a range of actors. */
export type SequenceNoteAnchor =
  | { readonly kind: 'over'; readonly actor: string }
  | { readonly kind: 'span'; readonly from: string; readonly to: string }
  | { readonly kind: 'side'; readonly actor: string; readonly side: 'left' | 'right' };

export interface SequenceNote {
  readonly type: 'note';
  readonly anchor: SequenceNoteAnchor;
  readonly text: string;
  readonly tone?: SequenceTone;
}

/** One step in the diagram — either a message arrow or a floating note. */
export type SequenceStep = SequenceMessage | SequenceNote;

export interface SequenceData {
  readonly actors: readonly SequenceActor[];
  readonly steps: readonly SequenceStep[];
  /** If true, messages are prefixed with 1., 2., 3. … */
  readonly autonumber?: boolean;
}
