import type { Schema } from 'effect';

export const EditorControlId = Symbol.for('@hyperkit/editor/control');
export const EditorGroupId = Symbol.for('@hyperkit/editor/group');
export const EditorHiddenId = Symbol.for('@hyperkit/editor/hidden');

export type EditorControl =
  'text' | 'number' | 'boolean' | 'select' | 'color' | 'slider' | 'textarea' | 'icon';

export interface PropDescriptor {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'unknown';
  required: boolean;
  default?: unknown;
  description?: string;
  control?: EditorControl;
  group?: string;
  options?: (string | number | boolean)[];
  hidden?: boolean;
}

/** Typed editor schema definition - pass to introspectSchema() */
export type EditorSchema = Schema.Schema.AnyNoContext;
