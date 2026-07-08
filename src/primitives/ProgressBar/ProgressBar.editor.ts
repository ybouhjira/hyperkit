import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId, EditorControlId } from '../../editor/types.js';

export const ProgressBarEditorSchema = S.Struct({
  value: S.optional(
    S.Number.annotations({
      [AST.DescriptionAnnotationId]: 'Progress value (0-100).',
      [AST.DefaultAnnotationId]: 0,
      [EditorControlId]: 'slider',
      [EditorGroupId]: 'State',
    })
  ),
  indeterminate: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Show indeterminate/loading animation.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'State',
    })
  ),
  size: S.optional(
    S.Literal('sm', 'md', 'lg').annotations({
      [AST.DescriptionAnnotationId]: 'Size preset.',
      [AST.DefaultAnnotationId]: 'md',
      [EditorGroupId]: 'Appearance',
    })
  ),
  color: S.optional(
    S.String.annotations({
      [AST.DescriptionAnnotationId]: 'Fill color (CSS color value).',
      [AST.DefaultAnnotationId]: 'var(--sk-accent)',
      [EditorControlId]: 'color',
      [EditorGroupId]: 'Appearance',
    })
  ),
});
