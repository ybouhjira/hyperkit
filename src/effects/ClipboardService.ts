import { Context, Effect } from 'effect';
import type { ClipboardError } from './errors';

export interface ClipboardService {
  readonly copy: (text: string) => Effect.Effect<void, ClipboardError>;
  readonly paste: Effect.Effect<string, ClipboardError>;
}

export const ClipboardService = Context.GenericTag<ClipboardService>('ClipboardService');
